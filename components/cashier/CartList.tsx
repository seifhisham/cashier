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
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Cart</div>
        <div className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 p-3 text-center text-sm text-slate-500 dark:border-slate-700">
            No items yet.
          </div>
        )}
        {items.map((it: UIItem) => (
          <div
            key={it.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md border border-slate-200 p-2 dark:border-slate-800"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{it.name}</div>
              <div className="truncate text-[11px] text-slate-500">{it.variant}</div>
              <div className="text-[11px] text-slate-500">Unit: {it.unit_price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                className="h-8 w-8 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                onClick={() => updateQty(it.id, it.quantity - 1)}
              >
                -
              </button>
              <div className="w-8 text-center text-sm text-slate-900 dark:text-slate-100">{it.quantity}</div>
              <button
                className="h-8 w-8 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                onClick={() => updateQty(it.id, it.quantity + 1)}
              >
                +
              </button>
              <button
                className="h-8 rounded-md border border-slate-300 px-2 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                onClick={() => remove(it.id)}
              >
                Remove
              </button>
            </div>
            <div className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">{it.line_total.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-medium dark:border-slate-800">
        <div className="text-slate-700 dark:text-slate-300">Subtotal</div>
        <div className="text-slate-900 dark:text-slate-100">{subtotal.toFixed(2)}</div>
      </div>
    </div>
  );
}
