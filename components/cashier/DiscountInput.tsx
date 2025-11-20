'use client';

import { useCartStore } from '../../lib/stores/cart';
import type { CartState } from '../../lib/stores/cart';
import { useShallow } from 'zustand/react/shallow';

export default function DiscountInput() {
  const { discount, setDiscount } = useCartStore(
    useShallow((s: CartState) => ({ discount: s.discount, setDiscount: s.setDiscount }))
  );

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Discount</div>
      <input
        type="number"
        min={0}
        step={0.01}
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
        className="w-full rounded-md border px-3 py-2"
        placeholder="0.00"
      />
    </div>
  );
}
