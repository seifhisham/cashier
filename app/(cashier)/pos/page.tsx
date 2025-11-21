import ProductSearch from '../../../components/cashier/ProductSearch';
import CartList from '../../../components/cashier/CartList';
import PaymentMethodSelector from '../../../components/cashier/PaymentMethodSelector';
import DiscountInput from '../../../components/cashier/DiscountInput';
import CheckoutSummary from '../../../components/cashier/CheckoutSummary';
import LogoutButton from '../../../components/auth/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function POSPage() {
  return (
    <div className="mx-auto max-w-8xl p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        <ProductSearch />
      </div>
      <div className="space-y-4 md:space-y-6 lg:sticky lg:top-4 h-fit">
        <div className="flex justify-end">
          <LogoutButton />
        </div>
        <CartList />
        <PaymentMethodSelector />
        {/* <DiscountInput /> */}
        <CheckoutSummary />
      </div>
    </div>
  );
}
