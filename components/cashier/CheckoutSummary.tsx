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
    const res = await completeSale();
    alert(`Sale completed. Order ID: ${res.order_id}`);
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Discount</span><span>-{(discount || 0).toFixed(2)}</span></div>
      <div className="flex justify-between text-lg font-semibold border-t pt-2"><span>Total</span><span>{total.toFixed(2)}</span></div>
      <button
        className="mt-2 w-full rounded-md bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={onCheckout}
        disabled={subtotal <= 0}
      >
        Complete Sale ({payment_method})
      </button>
    </div>
  );
}
