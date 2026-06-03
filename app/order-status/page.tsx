'use client';

import { Suspense } from 'react';
import OrderStatusPage from '../components/OrderStatusPage';
import ProtectedRoute from '../components/ProtectedRoute';

function OrderStatusContent() {
  return <OrderStatusPage />;
}

export default function OrderStatus() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#232426' }}>
          <div className="text-white">Loading order status...</div>
        </div>
      }>
        <OrderStatusContent />
      </Suspense>
    </ProtectedRoute>
  );
}

