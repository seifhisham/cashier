'use client';

import { useCartStore } from '../../lib/stores/cart';
import type { CartState } from '../../lib/stores/cart';
import { useShallow } from 'zustand/react/shallow';

export default function CheckoutSummary() {
  const { subtotal, discount, payment_method, completeSale } = useCartStore(
    useShallow((s: CartState) => ({
      subtotal: s.subtotal,
      discount: s.discount,
      payment_method: s.payment_method,
      completeSale: s.completeSale,
    }))
  );

  const total = Math.max(0, subtotal - (discount || 0));

  async function onCheckout() {
    try {
      await completeSale();
      // success toast is dispatched in the store
    } catch (e: any) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app:toast', {
            detail: {
              type: 'error',
              title: 'Checkout failed',
              description: e?.message || 'Please try again',
            },
          }) as any
        );
      }
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Summary</div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
          <span>Discount</span>
          <span>-{(discount || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold dark:border-zinc-800 dark:text-zinc-100">
          <span>Total</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>
      <button
        className="mt-3 h-10 w-full rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        onClick={onCheckout}
        disabled={subtotal <= 0}
      >
        Complete Sale ({payment_method})
      </button>
    </div>
  );
}
