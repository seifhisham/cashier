import ProductSearch from '../../../components/cashier/ProductSearch';
import CartList from '../../../components/cashier/CartList';
import PaymentMethodSelector from '../../../components/cashier/PaymentMethodSelector';
import DiscountInput from '../../../components/cashier/DiscountInput';
import CheckoutSummary from '../../../components/cashier/CheckoutSummary';

export const dynamic = 'force-dynamic';

export default async function POSPage() {
  return (
    <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ProductSearch />
      </div>
      <div className="space-y-6">
        <CartList />
        <PaymentMethodSelector />
        <DiscountInput />
        <CheckoutSummary />
      </div>
    </div>
  );
}
