'use client';

import { useCartStore } from '../../lib/stores/cart';
import type { CartState } from '../../lib/stores/cart';
import { useShallow } from 'zustand/react/shallow';

export default function PaymentMethodSelector() {
  const { payment_method, setPaymentMethod } = useCartStore(
    useShallow((s: CartState) => ({
      payment_method: s.payment_method,
      setPaymentMethod: s.setPaymentMethod,
    }))
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Payment Method</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod('cash')}
          className={`h-9 rounded-md border px-3 text-sm font-medium transition-colors ${
            payment_method === 'cash'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-400'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200'
          }`}
        >
          Cash
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={`h-9 rounded-md border px-3 text-sm font-medium transition-colors ${
            payment_method === 'card'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-400'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200'
          }`}
        >
          Card
        </button>
      </div>
    </div>
  );
}
