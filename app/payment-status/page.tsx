import { Suspense } from 'react';
import PaymentStatusPage from '../components/PaymentStatusPage';
import ProtectedRoute from '../components/ProtectedRoute';

function PaymentStatusContent() {
  return <PaymentStatusPage />;
}

export default function PaymentStatus() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#232426' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading payment status...</p>
          </div>
        </div>
      }>
        <PaymentStatusContent />
      </Suspense>
    </ProtectedRoute>
  );
}

