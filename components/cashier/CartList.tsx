'use client';

import { useEffect } from 'react';
import { useCartStore } from '../../lib/stores/cart';
import type { CartState, UIItem } from '../../lib/stores/cart';
import { useShallow } from 'zustand/react/shallow';

export default function CartList() {
  const { items, load, updateQty, remove, subtotal } = useCartStore(
    useShallow((s: CartState) => ({
      items: s.items,
      load: s.load,
      updateQty: s.updateQty,
      remove: s.remove,
      subtotal: s.subtotal,
    }))
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Cart</div>
      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">No items yet.</div>}
        {items.map((it: UIItem) => (
          <div key={it.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-gray-500">{it.variant}</div>
              <div className="text-xs text-gray-500">Unit: {it.unit_price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border px-2 py-1" onClick={() => updateQty(it.id, it.quantity - 1)}>-</button>
              <div className="w-8 text-center">{it.quantity}</div>
              <button className="rounded-md border px-2 py-1" onClick={() => updateQty(it.id, it.quantity + 1)}>+</button>
              <button className="rounded-md border px-2 py-1" onClick={() => remove(it.id)}>Remove</button>
            </div>
            <div className="font-medium">{it.line_total.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t pt-2 font-medium">
        <div>Subtotal</div>
        <div>{subtotal.toFixed(2)}</div>
      </div>
    </div>
  );
}
