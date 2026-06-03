import PaymentMethodsPage from '../components/PaymentMethodsPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Checkout() {
  return (
    <ProtectedRoute>
      <PaymentMethodsPage />
    </ProtectedRoute>
  );
}
