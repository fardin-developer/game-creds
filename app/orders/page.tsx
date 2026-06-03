import OrderHistoryPage from '../components/OrderHistoryPage';
import AuthChecker from '../components/AuthChecker';

export default function OrderHistory() {
  return (
    <AuthChecker>
      <OrderHistoryPage />
    </AuthChecker>
  );
}
