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
    <div className="space-y-2">
      <div className="text-sm font-medium">Payment Method</div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" name="payment" value="cash" checked={payment_method === 'cash'} onChange={() => setPaymentMethod('cash')} />
          Cash
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="payment" value="card" checked={payment_method === 'card'} onChange={() => setPaymentMethod('card')} />
          Card
        </label>
      </div>
    </div>
  );
}
