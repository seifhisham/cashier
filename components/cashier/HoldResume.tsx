'use client';

import { useEffect, useState, useTransition } from 'react';
import { holdCurrentCart, listHeldCarts, resumeHeldCart, deleteHeldCart } from '../../app/(cashier)/pos/actions';
import { useCartStore } from '../../lib/stores/cart';

export default function HoldResume() {
  const [label, setLabel] = useState('');
  const [held, setHeld] = useState<Array<any>>([]);
  const [isPending, startTransition] = useTransition();
  const loadCart = useCartStore((s: any) => s.load);

  async function loadHeld() {
    startTransition(async () => {
      const rows = await listHeldCarts();
      setHeld(rows as any);
    });
  }

  useEffect(() => {
    loadHeld();
  }, []);

  function toast(detail: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:toast', { detail }) as any);
    }
  }

  function onHold() {
    startTransition(async () => {
      const res = await holdCurrentCart(label.trim());
      if ((res as any)?.ok) {
        toast({ type: 'success', title: 'Cart held', description: label ? `Label: ${label}` : undefined });
        setLabel('');
        await loadCart();
        await loadHeld();
      } else {
        toast({ type: 'error', title: 'Unable to hold cart', description: (res as any)?.error || '' });
      }
    });
  }

  function onResume(id: string) {
    startTransition(async () => {
      const res = await resumeHeldCart(id);
      if ((res as any)?.ok) {
        toast({ type: 'success', title: 'Cart resumed' });
        await loadCart();
        await loadHeld();
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      await deleteHeldCart(id);
      toast({ type: 'success', title: 'Held cart deleted' });
      await loadHeld();
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">Hold / Resume</h3>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Optional label (e.g., Customer name)"
            className="flex-1 h-9 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onHold}
            disabled={isPending}
            className="h-9 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Hold
          </button>
        </div>

        <div className="max-h-56 overflow-auto rounded-md border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                <th className="text-left px-2 py-1 font-medium">Label</th>
                <th className="text-left px-2 py-1 font-medium">Total</th>
                <th className="text-left px-2 py-1 font-medium">Date</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {held.length === 0 && (
                <tr>
                  <td className="px-2 py-2 text-slate-500" colSpan={4}>No held carts</td>
                </tr>
              )}
              {held.map((h: any) => {
                const lbl = (h?.shipping_address as any)?.hold_label ?? '';
                const total = Number(h?.total_amount ?? 0);
                const date = h?.created_at ? new Date(h.created_at).toLocaleString() : '';
                return (
                  <tr key={h.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-1">{lbl || '-'} </td>
                    <td className="px-2 py-1">{total.toFixed(2)}</td>
                    <td className="px-2 py-1 text-xs text-slate-500">{date}</td>
                    <td className="px-2 py-1">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onResume(h.id)}
                          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => onDelete(h.id)}
                          className="h-8 rounded-md border border-rose-300 bg-white px-2 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
