'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import apiClient from '@/lib/api/axios';
import TopSection from './TopSection';
import { useAppSelector } from '@/lib/hooks/redux';

interface AddCoinPageProps {
  onNavigate?: (screen: string) => void;
}

export default function AddCoinPage({ onNavigate }: AddCoinPageProps) {
  const router = useRouter();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Fetch wallet balance for display
  useState(() => {
    const fetchBalance = async () => {
      try {
        const authToken = token || localStorage.getItem('authToken');
        if (!authToken) return;
        const response = await apiClient.get('/user/me');
        const data = response.data;
        if (typeof data.walletBalance === 'number') {
          setWalletBalance(data.walletBalance);
        }
      } catch {
        // ignore balance fetch errors
      }
    };
    fetchBalance();
  });

  const coinPacks = [
    { amount: '250' },
    { amount: '500' },
    { amount: '1000' },
    { amount: '1500' },
    { amount: '2000' },
    { amount: '2500' }
  ];

  const handleCoinPackSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount('');
  };

  const handlePayment = async () => {
    const amount = selectedAmount || customAmount;
    if (!amount.trim()) return;
    const amountNumber = parseInt(amount);
    if (isNaN(amountNumber) || amountNumber < 1) return;

    setIsProcessing(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken || !isAuthenticated) {
        setTimeout(() => {
          if (onNavigate) onNavigate('login');
          else router.push('/login');
        }, 1500);
        return;
      }

      const response = await apiClient.post('/wallet/add', {
        amount: amountNumber,
        redirectUrl: typeof window !== 'undefined'
          ? `${window.location.origin}/payment-status`
          : 'https://zorotopup.com/payment-status'
      });

      const responseData = response.data;
      if (responseData.success && responseData.transaction?.paymentUrl) {
        window.location.href = responseData.transaction.paymentUrl;
      }
    } catch {
      // Error handling without toast
    } finally {
      setIsProcessing(false);
    }
  };

  const isSelected = (amount: string) => selectedAmount === amount;

  return (
    <div
      className="min-h-screen relative overflow-hidden p-0 m-0"
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

      <div className="w-full relative z-10">
        <TopSection showLogo={true} onNavigate={onNavigate} />

        {/* Balance Card */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)',
              boxShadow: '0 6px 24px rgba(231,18,27,0.28)'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Coin SVG icon — same as navbar */}
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FFFFFF" />
                  <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#E7121B" fontFamily="sans-serif">₮</text>
                </svg>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500 }}>Your Balance</p>
                <p style={{ color: '#FFFFFF', fontFamily: 'Poppins', fontSize: '20px', fontWeight: 800, lineHeight: 1.1 }}>{walletBalance} <span style={{ fontSize: '13px', fontWeight: 500 }}>coins</span></p>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '10px',
              padding: '6px 14px',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              <span style={{ color: '#FFFFFF', fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}>WALLET</span>
            </div>
          </div>
        </div>

        {/* Coin Packs Section */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <h2 style={{ color: '#1A1A22', fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', marginBottom: '14px' }}>
            Select Coin Pack
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {coinPacks.map((pack, index) => {
              const selected = isSelected(pack.amount);
              return (
                <div
                  key={index}
                  onClick={() => handleCoinPackSelect(pack.amount)}
                  style={{
                    borderRadius: '20px',
                    cursor: 'pointer',
                    padding: '14px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    background: selected
                      ? 'linear-gradient(145deg, #E0202D 0%, #B30B19 100%)'
                      : 'linear-gradient(150deg, #FFFFFF 0%, #F2F5FC 65%, #EBEEF7 100%)',
                    border: selected ? '2px solid rgba(176,16,33,0.85)' : '1.5px solid #D9DEE8',
                    boxShadow: selected
                      ? '0 10px 20px rgba(190,22,38,0.25)'
                      : '0 4px 14px rgba(34,42,66,0.10)',
                    transition: 'all 0.18s ease',
                    position: 'relative'
                  }}
                >
                  {/* Selected checkmark */}
                  {selected && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: '#22C55E', border: '2px solid white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Coin icon */}
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill={selected ? '#FFFFFF' : '#E7121B'} />
                    <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill={selected ? '#E7121B' : 'white'} fontFamily="sans-serif">₮</text>
                  </svg>

                  {/* Amount badge */}
                  <div style={{
                    background: selected ? 'rgba(255,255,255,0.22)' : '#F0F2F8',
                    borderRadius: '10px',
                    padding: '3px 12px',
                    border: selected ? '1px solid rgba(255,255,255,0.4)' : '1px solid #D9DEE8'
                  }}>
                    <span style={{
                      color: selected ? '#FFFFFF' : '#1A1A22',
                      fontFamily: 'Poppins',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}>{pack.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Section */}
        <div className="px-4 md:px-6 lg:px-8 mb-8">
          <h3 style={{ color: '#1A1A22', fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>
            Or enter a custom amount
          </h3>
          <div className="space-y-3">
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  border: customAmount && !selectedAmount ? '2px solid #E7121B' : '1.5px solid #D9DEE8',
                  color: '#1A1A22',
                  fontFamily: 'Poppins',
                  fontSize: '15px',
                  fontWeight: 600,
                  outline: 'none',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                }}
              />
            </div>
            <p style={{ color: '#9CA3AF', fontFamily: 'Poppins', fontSize: '12px' }}>
              Minimum amount: 1 coin
            </p>

            <button
              onClick={handlePayment}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              style={{
                width: '100%',
                padding: '15px 24px',
                borderRadius: '16px',
                background: isProcessing || (!selectedAmount && !customAmount)
                  ? '#D1D5DB'
                  : 'linear-gradient(135deg, #E7121B 0%, #BF0E16 100%)',
                border: 'none',
                color: isProcessing || (!selectedAmount && !customAmount) ? '#9CA3AF' : '#FFFFFF',
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '15px',
                cursor: isProcessing || (!selectedAmount && !customAmount) ? 'not-allowed' : 'pointer',
                boxShadow: isProcessing || (!selectedAmount && !customAmount)
                  ? 'none'
                  : '0 8px 24px rgba(231,18,27,0.32)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessing ? (
                <>
                  <div style={{
                    width: '18px', height: '18px',
                    border: '2.5px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spinCoin 0.8s linear infinite',
                    flexShrink: 0
                  }} />
                  Processing...
                </>
              ) : (
                <>
                  <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                  Pay Online
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-20" />
      </div>

      <style jsx>{`
        @keyframes spinCoin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::-webkit-inner-spin-button,
        input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
