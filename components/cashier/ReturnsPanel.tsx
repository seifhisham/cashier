'use client';

import { useState, useTransition } from 'react';
import { getOrderForReturn, processReturn } from '../../app/(cashier)/pos/actions';

export default function ReturnsPanel() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<Array<any>>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  function toast(detail: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:toast', { detail }) as any);
    }
  }

  function onLookup() {
    if (!orderId.trim()) return;
    startTransition(async () => {
      const data = await getOrderForReturn(orderId.trim());
      if (!data) {
        setOrder(null);
        setItems([]);
        setQty({});
        toast({ type: 'error', title: 'Order not found' });
        return;
      }
      setOrder(data.order);
      setItems(data.items || []);
      const init: Record<string, number> = {};
      (data.items || []).forEach((it: any) => {
        init[it.id] = 0;
      });
      setQty(init);
    });
  }

  function updateQty(id: string, v: string) {
    const n = Math.max(0, Math.floor(Number(v || '0')));
    setQty((q) => ({ ...q, [id]: n }));
  }

  function onReturn() {
    const payload = Object.entries(qty)
      .filter(([_, n]) => (n || 0) > 0)
      .map(([id, n]) => ({ order_item_id: id, quantity: n! }));
    if (payload.length === 0) {
      toast({ type: 'error', title: 'Select quantities to return' });
      return;
    }
    startTransition(async () => {
      const res = await processReturn(orderId.trim(), payload);
      if ((res as any)?.ok) {
        toast({ type: 'success', title: 'Return processed', description: `Refund: ${res.refund_amount?.toFixed?.(2) ?? res.refund_amount}` });
        setOrder(null);
        setItems([]);
        setQty({});
        setOrderId('');
      } else {
        toast({ type: 'error', title: 'Unable to process return', description: (res as any)?.error || '' });
      }
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">Returns / Exchanges</h3>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex gap-2">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID"
            className="flex-1 h-9 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onLookup}
            disabled={isPending || !orderId.trim()}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Lookup
          </button>
        </div>

        {order && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500">Date: {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</div>
            <div className="max-h-56 overflow-auto rounded-md border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    <th className="text-left px-2 py-1 font-medium">Item</th>
                    <th className="text-left px-2 py-1 font-medium">Sold</th>
                    <th className="text-left px-2 py-1 font-medium">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it: any) => {
                    const sold = Number(it.quantity ?? 0);
                    const name = it.products?.name ?? 'Item';
                    const variant = [it.product_variants?.size, it.product_variants?.color].filter(Boolean).join(' / ');
                    return (
                      <tr key={it.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-2 py-1">{name} <span className="text-xs text-slate-500">{variant}</span></td>
                        <td className="px-2 py-1">{sold}</td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min={0}
                            max={Math.abs(sold)}
                            value={qty[it.id] ?? 0}
                            onChange={(e) => updateQty(it.id, e.target.value)}
                            className="w-20 h-8 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onReturn}
                disabled={isPending}
                className="h-9 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                Process Return
              </button>
            </div>
            <div className="text-xs text-slate-500">For exchanges: process the return, then add new items to the cart and checkout normally.</div>
          </div>
        )}
      </div>
    </div>
  );
}
