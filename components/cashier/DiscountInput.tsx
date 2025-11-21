'use client';

import { useCartStore } from '../../lib/stores/cart';
import type { CartState } from '../../lib/stores/cart';
import { useShallow } from 'zustand/react/shallow';

export default function DiscountInput() {
  const { discount, setDiscount } = useCartStore(
    useShallow((s: CartState) => ({ discount: s.discount, setDiscount: s.setDiscount }))
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Discount</div>
      <input
        type="number"
        min={0}
        step={0.01}
        value={Number.isFinite(discount as any) ? discount : 0}
        onChange={(e) => setDiscount(Number(e.target.value))}
        className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
        placeholder="0.00"
      />
    </div>
  );
}
