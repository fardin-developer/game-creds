'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api/axios';
import TopSection from './TopSection';

interface PaymentStatusPageProps {
  onNavigate?: (screen: string) => void;
}

type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

interface TransactionData {
  orderId: string;
  status: TransactionStatus;
  amount: number;
  utr?: string;
  gatewayType: string;
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  paymentNote: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({ onNavigate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPaymentStatus = useCallback(async (clientTxnId: string | null, txnId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('checkPaymentStatus called with:', { clientTxnId, txnId });

      // Build query string - use clientTxnId as client_txn_id parameter
      const queryParams = new URLSearchParams();
      if (clientTxnId) {
        // Map clientTxnId variable to client_txn_id API parameter
        queryParams.append('client_txn_id', clientTxnId);
      }
      if (txnId) {
        queryParams.append('txn_id', txnId);
      }

      const apiUrl = `/transaction/status?${queryParams.toString()}`;
      console.log('Calling API:', apiUrl);
      const response = await apiClient.get(apiUrl);
      const result = response.data;

      console.log('API Response:', result);

      if (result.success && result.data) {
        setTransactionData(result.data);
        setIsSuccess(result.data.status === 'success');
      } else {
        setIsSuccess(false);
        setError('Failed to fetch transaction status');
      }
    } catch (error: any) {
      console.error('Error fetching transaction status:', error);
      setIsSuccess(false);
      setError(error?.response?.data?.message || 'Failed to fetch transaction status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get transaction IDs from URL params inside useEffect
    // If params has clientTxnId, use it as client_txn_id in API call
    const getUrlParam = (param: string) => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      }
      return null;
    };

    // Check for clientTrxId (with lowercase 'x') first, then clientTxnId, then client_txn_id
    // The payment gateway sends clientTrxId in the URL
    const clientTxnId = getUrlParam('clientTrxId') ||
      searchParams?.get('clientTrxId') ||
      getUrlParam('clientTxnId') ||
      searchParams?.get('clientTxnId') ||
      getUrlParam('client_txn_id') ||
      searchParams?.get('client_txn_id');

    // Check for transactionId (from payment gateway), txnId, then txn_id
    const txnId = getUrlParam('transactionId') ||
      searchParams?.get('transactionId') ||
      getUrlParam('txnId') ||
      searchParams?.get('txnId') ||
      getUrlParam('txn_id') ||
      searchParams?.get('txn_id');

    console.log('useEffect - URL params:', {
      clientTxnId,
      txnId,
      searchParams: searchParams?.toString(),
      windowLocation: typeof window !== 'undefined' ? window.location.search : 'N/A'
    });

    if (clientTxnId || txnId) {
      checkPaymentStatus(clientTxnId, txnId);
    } else {
      console.error('Missing required parameters: client_txn_id or txn_id');
      setError('Missing required parameters: client_txn_id or txn_id');
      setIsLoading(false);
    }
  }, [searchParams, checkPaymentStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
        <TopSection showLogo={true} onNavigate={onNavigate} />
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-base sm:text-xl">Loading transaction status...</div>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: TransactionStatus | undefined) => {
    if (!status) return { icon: null, text: 'Unknown Status', bgColor: '#6B7280', textColor: 'text-gray-400' };

    switch (status) {
      case 'success':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ),
          text: 'Order Placed Successfully',
          bgColor: '#20B2AA',
          textColor: 'text-green-400'
        };
      case 'failed':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: 'Failed To Place Order',
          bgColor: '#DC2626',
          textColor: 'text-red-400'
        };
      case 'cancelled':
        return {
          icon: (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: 'Order Cancelled',
          bgColor: '#DC2626',
          textColor: 'text-red-400'
        };
      case 'pending':
        return {
          icon: (
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: '#FEF3C7' }}>
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
                <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0110 10h-2a8 8 0 00-8-8V2z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FEF3C7' }}></div>
              </div>
            </div>
          ),
          text: 'Order Pending',
          bgColor: '#FDE047',
          textColor: 'text-yellow-300'
        };
      default:
        return {
          icon: null,
          text: 'Unknown Status',
          bgColor: '#6B7280',
          textColor: 'text-gray-400'
        };
    }
  };

  const statusConfig = getStatusConfig(transactionData?.status);
  const isTransactionSuccess = transactionData?.status === 'success';

  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
      {/* Desktop Container */}
      <div className="w-full">
        {/* Top Section with Logo */}
        <div className="relative z-10">
          <TopSection showLogo={true} onNavigate={onNavigate} />
        </div>

        {/* Status Section */}
        <div className="flex flex-col items-center py-6">
          {/* Status Icon */}
          <div
            className="rounded-full flex items-center justify-center mb-4"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: statusConfig.bgColor
            }}
          >
            {statusConfig.icon}
          </div>

          {/* Status Text */}
          <h1 className="text-white font-bold mb-2 text-2xl sm:text-3xl text-center">
            {error ? 'Error' : statusConfig.text}
          </h1>
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center px-4">
              {error}
            </p>
          )}
        </div>

        {/* Transaction Details Card */}
        {transactionData && (
          <div className="px-4 md:px-6 lg:px-8 mb-6">
            <div
              className="p-4 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, #7F8CAA 0%, #5C667C 100%)',
                boxShadow: '0px 4px 4px 0px #00000040'
              }}
            >
              <div className="flex">
                {/* Left Column - Labels */}
                <div className="space-y-3" style={{ width: '120px' }}>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Order Date</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Order ID</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Product</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Order Details</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Price</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>User ID</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Zone ID</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>Status</div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-white mx-4"></div>

                {/* Right Column - Values */}
                <div className="flex-1 space-y-3">
                  <div className="text-green-400 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {formatDate(transactionData.createdAt)}
                  </div>
                  <div className="text-blue-400 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {transactionData.orderId}
                  </div>
                  <div className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {transactionData.customerName}
                  </div>
                  <div className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {transactionData.paymentNote || 'N/A'}
                  </div>
                  <div className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {transactionData.amount} INR
                  </div>
                  <div className="text-blue-400 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {transactionData.customerNumber}
                  </div>
                  <div className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}>
                    {transactionData.customerEmail}
                  </div>
                  <div
                    className={`text-sm font-medium ${statusConfig.textColor}`}
                    style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', lineHeight: '100%', letterSpacing: '0%' }}
                  >
                    {transactionData.status.charAt(0).toUpperCase() + transactionData.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 md:px-6 lg:px-8 mb-8">
          <div className="flex gap-4">
            <button
              className="flex-1 py-3 px-4 rounded-4xl border-2 border-white text-white"
              style={{ fontSize: '16px', backgroundColor: 'transparent' }}
              onClick={() => onNavigate ? onNavigate('topup') : router.push('/')}
            >
              Top Up Again
            </button>
            <button
              className="flex-1 py-3 px-4 rounded-4xl text-white"
              style={{ backgroundColor: 'rgb(75, 85, 99)', fontSize: '16px' }}
              onClick={() => onNavigate ? onNavigate('orders') : router.push('/orders')}
            >
              Order History
            </button>
          </div>
        </div>

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-15"></div>

        {/* Bottom Navigation */}
      </div>
    </div>
  );
};

export default PaymentStatusPage;

