'use client';

import { create } from 'zustand';
import { addToCart, getCart, removeFromCart, updateCartQuantity, checkout, type PaymentMethod } from '../../app/(cashier)/pos/actions';

export type UIItem = {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  variant_id?: string;
  product_id?: string;
};

export interface CartState {
  items: UIItem[];
  subtotal: number;
  discount: number;
  payment_method: PaymentMethod;
  loading: boolean;
  load: () => Promise<void>;
  add: (productId: string, variantId: string) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  setDiscount: (d: number) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  clearLocal: () => void;
  completeSale: () => Promise<{ order_id: string; total_amount: number }>;
}

export const useCartStore = create<CartState>((set: any, get: any) => ({
  items: [],
  subtotal: 0,
  discount: 0,
  payment_method: 'cash',
  loading: false,
  async load() {
    set({ loading: true });
    const { items, subtotal } = await getCart();
    const uiItems: UIItem[] = items.map((it: any) => ({
      id: it.id,
      name: it.products?.name ?? 'Product',
      variant: [it.product_variants?.size, it.product_variants?.color].filter(Boolean).join(' / '),
      quantity: it.quantity ?? 0,
      unit_price: it.unit_price,
      line_total: it.line_total,
      variant_id: it.variant_id,
      product_id: it.product_id,
    }));
    set({ items: uiItems, subtotal, loading: false });
  },
  async add(productId: string, variantId: string) {
    const res = await addToCart(productId, variantId);
    if (res && (res as any).ok === false && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: {
            type: 'error',
            title: 'Cannot add item',
            description: (res as any).error ?? 'Unable to add item',
          },
        }) as any
      );
    }
    if (res && (res as any).ok === true && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: {
            type: 'success',
            title: 'Added to cart',
          },
        }) as any
      );
    }
    await get().load();
  },
  async updateQty(itemId: string, quantity: number) {
    await updateCartQuantity(itemId, quantity);
    await get().load();
  },
  async remove(itemId: string) {
    await removeFromCart(itemId);
    await get().load();
  },
  setDiscount(d: number) {
    set({ discount: Math.max(0, d || 0) });
  },
  setPaymentMethod(m: PaymentMethod) {
    set({ payment_method: m });
  },
  clearLocal() {
    set({ items: [], subtotal: 0, discount: 0 });
  },
  async completeSale() {
    const res = await checkout({ discount: get().discount, payment_method: get().payment_method });
    set({ items: [], subtotal: 0, discount: 0 });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: {
            type: 'success',
            title: 'Sale completed',
            description: `Order ID: ${res.order_id}`,
          },
        }) as any
      );
    }
    return res;
  },
}));
