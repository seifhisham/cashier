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
    }));
    set({ items: uiItems, subtotal, loading: false });
  },
  async add(productId: string, variantId: string) {
    await addToCart(productId, variantId);
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
    return res;
  },
}));
