'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks/redux';
import { updateUser } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';
import TopSection from './TopSection';

interface PaymentMethodsPageProps {
  onNavigate?: (screen: string) => void;
}

export default function PaymentMethodsPage({ onNavigate }: PaymentMethodsPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [packDetails, setPackDetails] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Get pack details from localStorage
    const storedPack = localStorage.getItem('selectedPack');
    if (storedPack) {
      setPackDetails(JSON.parse(storedPack));
    }

    // Fetch wallet balance
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Let ProtectedRoute handle navigation; just stop loading
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get('/user/me');
      const data = response.data;
      const balanceCandidate =
        (data && (data.walletBalance ?? data.user?.walletBalance ?? data.data?.walletBalance ?? data.data?.user?.walletBalance));
      if (typeof balanceCandidate === 'number') {
        setWalletBalance(balanceCandidate);
      } else if (typeof balanceCandidate === 'string' && !isNaN(Number(balanceCandidate))) {
        setWalletBalance(Number(balanceCandidate));
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processUPIPayment = async () => {
    try {
      setIsProcessingPayment(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        // toast.error('Authentication token not found');
        return;
      }

      if (!packDetails) {
        // toast.error('No pack selected');
        return;
      }

      // Build request body dynamically - include all validation fields from packDetails
      const requestBody: any = {
        diamondPackId: packDetails.packId,
        amount: packDetails.packAmount,
        quantity: 1,
        redirectUrl: typeof window !== 'undefined'
          ? `${window.location.origin}/payment-status`
          : 'https://zorotopup.com/payment-status'
      };

      // Add all validation fields dynamically (exclude standard pack fields)
      const standardFields = ['packId', 'gameId', 'gameName', 'gameImage', 'packDescription', 'packAmount', 'packLogo', 'packCategory'];
      Object.keys(packDetails).forEach((key) => {
        if (!standardFields.includes(key)) {
          requestBody[key] = packDetails[key];
        }
      });

      const response = await apiClient.post('/order/diamond-pack-upi', requestBody);
      const responseData = response.data;

      if (responseData.success && responseData.transaction?.paymentUrl) {
        // toast.success('Payment request created successfully! Redirecting...');
        // Redirect to payment URL
        window.location.href = responseData.transaction.paymentUrl;
      } else {
        // toast.error(responseData.message || 'Failed to create payment request');
      }
    } catch (error: any) {
      console.error('Error processing UPI payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while processing payment';
      // toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processWalletPayment = async () => {
    try {
      setIsProcessingPayment(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        // toast.error('Authentication token not found');
        return;
      }

      if (!packDetails) {
        // toast.error('No pack selected');
        return;
      }

      // Build request body dynamically - include all validation fields from packDetails
      const requestBody: any = {
        diamondPackId: packDetails.packId,
        quantity: 1
      };

      // Add all validation fields dynamically (exclude standard pack fields)
      const standardFields = ['packId', 'gameId', 'gameName', 'gameImage', 'packDescription', 'packAmount', 'packLogo', 'packCategory'];
      Object.keys(packDetails).forEach((key) => {
        if (!standardFields.includes(key)) {
          requestBody[key] = packDetails[key];
        }
      });

      const response = await apiClient.post('/order/diamond-pack', requestBody);
      const responseData = response.data;

      if (responseData.success) {
        // Update wallet balance after successful payment
        try {
          const userResponse = await apiClient.get('/user/me');
          const userData = userResponse.data;
          const updatedBalance = userData?.walletBalance ?? userData?.user?.walletBalance ?? userData?.data?.walletBalance;
          if (typeof updatedBalance === 'number') {
            // Update Redux state
            dispatch(updateUser({ walletBalance: updatedBalance }));
            // Update local state
            setWalletBalance(updatedBalance);
          } else if (typeof updatedBalance === 'string' && !isNaN(Number(updatedBalance))) {
            const balanceNum = Number(updatedBalance);
            dispatch(updateUser({ walletBalance: balanceNum }));
            setWalletBalance(balanceNum);
          }
        } catch (error) {
          console.error('Error fetching updated wallet balance:', error);
          // Still proceed with redirect even if balance update fails
        }

        // For wallet payments, redirect to order status page using orderId
        const orderId = responseData.orderId ||
          responseData.order?.orderId ||
          responseData.data?.orderId ||
          responseData.order?._id;

        if (orderId) {
          // Redirect to order status page
          if (onNavigate) {
            onNavigate('order-status');
          } else {
            router.push(`/order-status?orderId=${encodeURIComponent(orderId)}`);
          }
        } else {
          // Fallback: check for transaction IDs and redirect to payment status
          const transaction = responseData.transaction || responseData.data?.transaction;
          const clientTxnId = transaction?.clientTxnId || transaction?.client_txn_id || transaction?.clientTrxId;
          const txnId = transaction?.txnId || transaction?.txn_id || transaction?.transactionId;

          if (clientTxnId || txnId) {
            const params = new URLSearchParams();
            if (clientTxnId) {
              params.append('clientTxnId', clientTxnId);
            }
            if (txnId) {
              params.append('transactionId', txnId);
            }

            if (onNavigate) {
              onNavigate('payment-status');
            } else {
              router.push(`/payment-status?${params.toString()}`);
            }
          } else {
            // Final fallback to dashboard
            if (onNavigate) {
              onNavigate('home');
            } else {
              router.push('/');
            }
          }
        }
      } else {
        // toast.error(responseData.message || 'Failed to process wallet payment');
      }
    } catch (error: any) {
      console.error('Error processing wallet payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while processing payment';
      // toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
      {/* Desktop Container */}
      <div className="w-full">
        {/* Top Section with Logo */}
        <div className="relative z-10">
          <TopSection showLogo={true} onNavigate={onNavigate} />
        </div>

        {/* Page Title */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <h1 className="text-white font-bold text-xl sm:text-2xl">Payment Methods</h1>
        </div>

        {/* Payment Summary - Order-style box */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(90deg, #7F8CAA 0%, #5C667C 100%)', boxShadow: '0px 4px 4px 0px #00000040' }}>
            <div className="flex">
              <div className="space-y-3" style={{ width: '120px' }}>
                <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px' }}>Product</div>
                <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px' }}>Amount</div>
              </div>
              <div className="w-px bg-white mx-4"></div>
              <div className="flex-1 space-y-3">
                <div className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px' }}>
                  {packDetails ? `${packDetails.packDescription}` : '—'}
                </div>
                <div className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px' }}>
                  {packDetails ? `₹${packDetails.packAmount}` : isLoading ? 'Loading...' : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="px-4 md:px-6 lg:px-8 mb-8">
          <div className="space-y-4">
            {/* Coins Option - Order-style box */}
            <div
              className={`p-4 rounded-3xl cursor-pointer transition-all ${selectedPaymentMethod === 'zoro-coins' ? 'ring-4 ring-white' : ''} ${packDetails && walletBalance < packDetails.packAmount ? 'opacity-60' : ''}`}
              style={{ background: 'linear-gradient(90deg, #7F8CAA 0%, #5C667C 100%)', boxShadow: '0px 4px 4px 0px #00000040', border: selectedPaymentMethod === 'zoro-coins' ? '3px solid white' : 'none' }}
              onClick={() => {
                if (packDetails && walletBalance < packDetails.packAmount) {
                  // toast.error(`Insufficient coins! You have ${walletBalance} coins but need ${packDetails.packAmount} coins for this pack.`);
                  return;
                }
                setSelectedPaymentMethod('zoro-coins');
              }}
            >
              <div className="flex">
                <div className="space-y-3" style={{ width: '120px' }}>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px' }}>Method</div>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px' }}>Available</div>
                </div>
                <div className="w-px bg-white mx-4"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <Image src="/coin.png" alt="Coin" width={32} height={32} className="rounded-full" style={{ color: 'transparent' }} />
                    </div>
                    <span className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px' }}>Coins</span>
                  </div>
                  <div>
                    <span className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px' }}>{isLoading ? '...' : `${walletBalance} coins`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Option - Order-style box */}
            <div
              className={`p-4 rounded-3xl cursor-pointer transition-all ${selectedPaymentMethod === 'upi' ? 'ring-4 ring-white' : ''}`}
              style={{ background: 'linear-gradient(90deg, #7F8CAA 0%, #333844 100%)', boxShadow: '0px 4px 4px 0px #00000040', border: selectedPaymentMethod === 'upi' ? '3px solid white' : 'none' }}
              onClick={() => setSelectedPaymentMethod('upi')}
            >
              <div className="flex">
                <div className="space-y-3" style={{ width: '120px' }}>
                  <div className="text-gray-300 text-sm" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px' }}>Method</div>
                </div>
                <div className="w-px bg-white mx-4"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <Image src="/UPI_logo.svg.png" alt="UPI Logo" width={40} height={40} className="rounded-lg" />
                    </div>
                    <span className="text-white text-sm" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px' }}>UPI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Securely Button */}
        <div className="px-4 md:px-6 lg:px-8 mt-8 sm:mt-10 mb-8 flex justify-center">
          <button
            type="button"
            className="w-full max-w-sm py-3 sm:py-4 rounded-4xl text-white font-bold text-base sm:text-lg flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: 'rgb(127, 140, 170)',
              border: '1px solid',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '100%',
              padding: '17px 100px 17px 100px',
              boxShadow: '0px 4px 4px 0px #00000040',
              opacity: isProcessingPayment ? 0.7 : 1
            }}
            aria-busy={isProcessingPayment}
            disabled={isProcessingPayment}
            onClick={async () => {
              if (!selectedPaymentMethod) {
                // toast.error('Please select a payment method');
                return;
              }

              if (selectedPaymentMethod === 'zoro-coins') {
                // Check if user has enough coins
                if (!packDetails) {
                  // toast.error('No pack selected');
                  return;
                }

                if (walletBalance < packDetails.packAmount) {
                  // toast.error(`Insufficient coins! You have ${walletBalance} coins but need ${packDetails.packAmount} coins for this pack.`);
                  return;
                }

                // Proceed with Serene Coins payment
                await processWalletPayment();
              } else if (selectedPaymentMethod === 'upi') {
                // Handle UPI payment
                await processUPIPayment();
              }
            }}
          >
            {isProcessingPayment ? 'PROCESSING...' : 'PAY SECURELY'}
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-15"></div>

        {/* Bottom Navigation */}
      </div>
    </div>
  );
}
