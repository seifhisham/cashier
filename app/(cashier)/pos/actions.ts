'use server';

import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '../../../lib/supabase/server';
import type { Database, Tables } from '../../../types/database';

export type PaymentMethod = 'cash' | 'card';

const CART_COOKIE = 'cashier_session_id';

async function ensureSessionId() {
  const store = await cookies();
  let id = store.get(CART_COOKIE)?.value;
  if (!id) {
    id = nanoid(16);
    // cookie for 7 days
    store.set(CART_COOKIE, id, { httpOnly: false, path: '/', maxAge: 60 * 60 * 24 * 7 });
  }
  return id;
}

function num(x: string | number | null | undefined) {
  if (x == null) return 0;
  if (typeof x === 'number') return x;
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export type ProductWithVariants = Tables<'products'> & {
  product_variants: Tables<'product_variants'>[];
  product_images?: Tables<'product_images'>[];
};

export type CartItemJoined = Tables<'cart_items'> & {
  products: Tables<'products'> | null;
  product_variants: Tables<'product_variants'> | null;
};

export async function searchProducts(query: string) {
  const supabase = getServerSupabase();
  let q = supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .order('created_at', { ascending: false })
    .limit(40);

  if (query && query.trim().length > 0) {
    const term = query.trim();
    q = q.or(`name.ilike.%${term}%,category.ilike.%${term}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithVariants[];
}

export async function getCart() {
  const supabase = getServerSupabase();
  const sessionId = await ensureSessionId();

  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*), product_variants(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  const items = (data ?? []) as unknown as CartItemJoined[];

  const computed = items.map((it) => {
    const base = num(it.products?.base_price);
    const adj = num(it.product_variants?.price_adjustment);
    const unit_price = base + adj;
    const line_total = unit_price * (it.quantity ?? 0);
    return { ...it, unit_price, line_total };
  });

  const subtotal = computed.reduce((s, it) => s + it.line_total, 0);
  return { items: computed, subtotal };
}

export async function addToCart(productId: string, variantId: string) {
  const supabase = getServerSupabase();
  const sessionId = await ensureSessionId();

  const { data: existing, error: exErr } = await (supabase as any)
    .from('cart_items')
    .select('id, quantity')
    .eq('session_id', sessionId)
    .eq('product_id', productId)
    .eq('variant_id', variantId)
    .maybeSingle();
  if (exErr && exErr.code !== 'PGRST116') throw exErr;

  if (existing) {
    const { error } = await (supabase as any)
      .from('cart_items')
      .update({ quantity: (existing.quantity ?? 0) + 1, updated_at: new Date().toISOString() } as any)
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await (supabase as any).from('cart_items').insert({
      session_id: sessionId,
      product_id: productId,
      variant_id: variantId,
      quantity: 1,
    } as any);
    if (error) throw error;
  }

  revalidatePath('/pos');
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const supabase = getServerSupabase();
  if (quantity <= 0) {
    const { error } = await (supabase as any).from('cart_items').delete().eq('id', itemId);
    if (error) throw error;
    revalidatePath('/pos');
    return;
  }
  const { error } = await (supabase as any)
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() } as any)
    .eq('id', itemId);
  if (error) throw error;
  revalidatePath('/pos');
}

export async function removeFromCart(itemId: string) {
  const supabase = getServerSupabase();
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
  if (error) throw error;
  revalidatePath('/pos');
}

export async function checkout(input: { discount: number; payment_method: PaymentMethod }) {
  const supabase = getServerSupabase();
  const sessionId = await ensureSessionId();

  const { data, error } = await (supabase as any)
    .from('cart_items')
    .select('*, products(*), product_variants(*)')
    .eq('session_id', sessionId);
  if (error) throw error;
  const items = (data ?? []) as unknown as CartItemJoined[];
  if (items.length === 0) throw new Error('Cart is empty');

  const lines = items.map((it) => {
    const unit = num(it.products?.base_price) + num(it.product_variants?.price_adjustment);
    const qty = it.quantity ?? 0;
    const total = unit * qty;
    return { it, unit, qty, total };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const discount = Math.max(0, input.discount || 0);
  const total_amount = Math.max(0, subtotal - discount);

  const status = input.payment_method === 'cash' ? 'completed_cash' : 'completed_card';

  const { data: order, error: orderErr } = await (supabase as any)
    .from('orders')
    .insert({
      user_id: null,
      guest_email: null,
      total_amount: String(total_amount),
      status,
      shipping_address: {},
    } as any)
    .select('id')
    .single();
  if (orderErr) throw orderErr;

  const orderId = order.id as string;

  const orderItems = lines.map((l) => ({
    order_id: orderId,
    product_id: l.it.product_id!,
    variant_id: l.it.variant_id!,
    quantity: l.qty,
    price_at_purchase: String(l.unit),
  }));

  const { error: oiErr } = await (supabase as any).from('order_items').insert(orderItems as any);
  if (oiErr) throw oiErr;

  for (const l of lines) {
    const variantId = l.it.variant_id!;
    const current = num(l.it.product_variants?.stock_quantity ?? 0);
    const newQty = Math.max(0, current - l.qty);
    const { error: upErr } = await (supabase as any)
      .from('product_variants')
      .update({ stock_quantity: newQty } as any)
      .eq('id', variantId);
    if (upErr) throw upErr;
  }

  const { error: delErr } = await (supabase as any).from('cart_items').delete().eq('session_id', sessionId);
  if (delErr) throw delErr;

  revalidatePath('/pos');
  return { order_id: orderId, total_amount };
}
