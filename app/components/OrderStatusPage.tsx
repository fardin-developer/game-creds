'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api/axios';
import TopSection from './TopSection';

interface OrderStatusPageProps {
  onNavigate?: (screen: string) => void;
}

type OrderStatus = 'processing' | 'completed' | 'failed' | 'cancelled' | 'pending';

interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  _id: string;
}

interface OrderData {
  _id: string;
  orderType: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: string;
  items: OrderItem[];
  description: string;
  createdAt: string;
}

interface OrderStatusResponse {
  success: boolean;
  message: string;
  orderId: string;
  performance: {
    totalProviders: number;
    successfulCount: number;
    failedCount: number;
  };
  successfulProviders: string[];
  failedProviders: string[];
  attemptedProviders: string[];
  order: OrderData;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ onNavigate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [orderData, setOrderData] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingAttempt = useRef(0);
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const orderIdRef = useRef<string | null>(null);

  const clearPolling = () => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  };

  const scheduleNextPoll = useCallback(() => {
    if (!orderIdRef.current) return;
    const attempt = pollingAttempt.current;

    // Polling strategy: 4 times at 10s intervals, then 6 times at 5s intervals. Total 10 polls.
    if (attempt >= 10) return;

    // first 4 attempts have delay of 10s, next 6 have delay of 5s
    const delay = attempt < 4 ? 10000 : 5000;

    clearPolling();
    pollingTimer.current = setTimeout(() => {
      pollingAttempt.current += 1;
      checkOrderStatus(orderIdRef.current!, false);
    }, delay);
  }, []);

  const checkOrderStatus = useCallback(async (orderId: string, isInitial = true) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsPolling(true);
      }
      setError(null);

      const apiUrl = `/order/order-status?orderId=${encodeURIComponent(orderId)}`;
      const response = await apiClient.get(apiUrl);
      const result = response.data;

      if (result.success) {
        setOrderData(result);

        // Schedule next poll if still pending or processing
        const status = result.order?.status;
        if (status === 'pending' || status === 'processing') {
          scheduleNextPoll();
        } else {
          clearPolling(); // stop polling once completed/failed
        }
      } else {
        setError(result.message || 'Failed to fetch order status');
        clearPolling();
      }
    } catch (error: any) {
      console.error('Error fetching order status:', error);
      setError(error?.response?.data?.message || 'Failed to fetch order status');
      clearPolling();
    } finally {
      if (isInitial) setIsLoading(false);
      setIsPolling(false);
    }
  }, [scheduleNextPoll]);

  useEffect(() => {
    const getUrlParam = (param: string) => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      }
      return null;
    };

    const orderId = getUrlParam('orderId') ||
      searchParams?.get('orderId') ||
      getUrlParam('order_id') ||
      searchParams?.get('order_id');

    if (orderId) {
      orderIdRef.current = orderId;
      // Reset polling attempts on mount
      pollingAttempt.current = 0;
      checkOrderStatus(orderId, true);
    } else {
      setError('Missing required parameter: orderId');
      setIsLoading(false);
    }

    return () => clearPolling(); // cleanup on unmount
  }, [searchParams, checkOrderStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const parseDescription = (description: string) => {
    try {
      const parsed = JSON.parse(description);
      return parsed;
    } catch {
      return { text: description };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#EFEBF0' }}>
        <TopSection showLogo={true} onNavigate={onNavigate} />
        <div className="flex items-center justify-center py-32 flex-col">
          <div className="w-12 h-12 border-4 border-[#E7121B] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[#1A1A22] font-semibold">Loading order...</div>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: OrderStatus | undefined) => {
    if (!status) return {
      icon: null, text: 'Unknown', bgGradient: 'linear-gradient(135deg, #6B7280, #374151)',
      textColor: '#6B7280', badgeStyle: {}
    };

    switch (status) {
      case 'completed':
        return {
          icon: (
            <img src="/Success.gif" alt="Success" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.8)' }} />
          ),
          text: 'Order Successful',
          bgGradient: 'transparent',
          boxShadow: 'none',
          textColor: '#16A34A',
          badgeStyle: { color: '#16A34A', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }
        };
      case 'failed':
      case 'cancelled':
        return {
          icon: (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: status === 'failed' ? 'Order Failed' : 'Order Cancelled',
          bgGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          textColor: '#DC2626',
          badgeStyle: { color: '#DC2626', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }
        };
      case 'processing':
      case 'pending':
        return {
          icon: (
            <svg className="w-10 h-10 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          text: 'Processing...',
          bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          textColor: '#D97706',
          badgeStyle: { color: '#D97706', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }
        };
      default:
        return {
          icon: null, text: 'Unknown',
          bgGradient: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
          textColor: '#374151', badgeStyle: {}
        };
    }
  };

  const statusConfig = orderData?.order ? getStatusConfig(orderData.order.status) : getStatusConfig(undefined);
  const parsedDesc = orderData?.order?.description ? parseDescription(orderData.order.description) : {};

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: '#EFEBF0',
        backgroundImage:
          'radial-gradient(circle at 8% 10%, rgba(231,18,27,0.10) 0, transparent 38%), radial-gradient(circle at 92% 5%, rgba(231,18,27,0.07) 0, transparent 28%), linear-gradient(180deg, #F3EFF6 0%, #EFEBF0 45%, #ECE7EE 100%)'
      }}
    >
      {/* Top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-40 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(231,18,27,0.13) 0%, rgba(231,18,27,0.03) 55%, transparent 100%)' }}
      />

      <div className="w-full relative z-10 pb-20">
        <TopSection showLogo={true} onNavigate={onNavigate} />

        {/* Status Header */}
        <div className="flex flex-col items-center py-8 px-4">
          <div
            className="rounded-full flex items-center justify-center mb-5 relative"
            style={{
              width: '90px',
              height: '90px',
              background: statusConfig.bgGradient,
              boxShadow: (statusConfig as any).boxShadow !== undefined ? (statusConfig as any).boxShadow : `0 12px 28px ${statusConfig.textColor}40`,
              zIndex: 2
            }}
          >
            {isPolling && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white shadow-lg"></div>
            )}
            {statusConfig.icon}
          </div>

          <h1 className="text-[#1A1A22] font-bold text-2xl sm:text-3xl text-center tracking-tight mb-2">
            {error ? 'Order Error' : statusConfig.text}
          </h1>

          {error && (
            <p className="text-red-500 text-sm font-medium mt-1 text-center bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </p>
          )}

          {isPolling && !error && (
            <div className="flex items-center text-sm font-medium mt-2 text-gray-500 bg-white/50 px-3 py-1 rounded-full border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-[#E7121B] animate-pulse mr-2"></span>
              Auto-updating...
            </div>
          )}
        </div>

        {/* Order Details Card */}
        {orderData && orderData.order && (
          <div className="px-4 md:px-6 lg:px-8 mb-6">
            <div
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
              style={{
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
              }}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <span className="text-[#1A1A22] font-bold text-lg">Order Summary</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  ...statusConfig.badgeStyle
                }}>
                  {orderData.order.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* Details list */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Order ID</span>
                  <span className="text-[#1A1A22] text-sm font-semibold">{orderData.orderId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Date & Time</span>
                  <span className="text-[#1A1A22] text-sm font-medium">{formatDate(orderData.order.createdAt)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Item</span>
                  <span className="text-[#E7121B] text-sm font-bold text-right" style={{ maxWidth: '60%' }}>
                    {orderData.order.items && orderData.order.items.length > 0
                      ? orderData.order.items.map(item => item.itemName).join(', ')
                      : 'Diamond Pack'}
                  </span>
                </div>

                {parsedDesc.playerId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Player ID</span>
                    <span className="text-[#1A1A22] text-sm font-semibold">{parsedDesc.playerId}</span>
                  </div>
                )}

                {parsedDesc.server && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Server</span>
                    <span className="text-[#1A1A22] text-sm font-semibold">{parsedDesc.server}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Payment Method</span>
                  <span className="text-[#1A1A22] text-sm font-medium capitalize">
                    {orderData.order.paymentMethod || 'Wallet'}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600 font-bold">Total Amount</span>
                  <span className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)' }}>
                    {orderData.order.amount} {orderData.order.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 md:px-6 lg:px-8 mt-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate ? onNavigate('topup') : router.push('/')}
              className="flex-1 py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide transition-all active:scale-95 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)',
                boxShadow: '0 8px 20px rgba(231,18,27,0.25)'
              }}
            >
              Order Again
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('orders') : router.push('/orders')}
              className="flex-1 py-3.5 px-4 rounded-xl text-[#1A1A22] bg-white font-bold text-sm tracking-wide transition-all active:scale-95 border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              Order History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderStatusPage;
