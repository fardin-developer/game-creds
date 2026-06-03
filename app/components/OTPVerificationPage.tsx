'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks/redux';
import { loginSuccess, loginFailure } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';

interface OTPVerificationPageProps {
  onNavigate?: (screen: string) => void;
}

export default function OTPVerificationPage({ onNavigate }: OTPVerificationPageProps) {
  const [otp, setOtp] = useState('');
  const [loginData, setLoginData] = useState<{ email: string, isPhoneLogin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(false);

    // Get login data
    const storedData = localStorage.getItem('loginData');
    if (storedData) {
      try {
        setLoginData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing loginData:', error);
        localStorage.removeItem('loginData');
        navigateBack();
      }
    } else {
      navigateBack();
    }
    setIsInitializing(false);
  }, []);

  const navigateBack = () => {
    if (onNavigate) {
      onNavigate('login');
    } else {
      router.push('/login');
    }
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsLoading(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (!isInitializing && loginData) {
      inputRef.current?.focus();
    }
  }, [isInitializing, loginData]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (errorMessage) setErrorMessage('');
  };

  const handleProceed = async () => {
    if (otp.length !== 6 || !loginData) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const requestBody = loginData.isPhoneLogin
        ? { phone: loginData.email, otp }
        : { email: loginData.email, otp };

      const response = await apiClient.post('/user/verify-otp', requestBody);
      const responseData = response.data;

      setIsSuccess(true);

      setTimeout(() => {
        if (responseData.requiresRegistration) {
          if (responseData.registrationToken) {
            localStorage.setItem('registrationToken', responseData.registrationToken);
          }
          if (onNavigate) onNavigate('register');
          else router.push('/register');
        } else {
          dispatch(loginSuccess({
            user: responseData.user,
            token: responseData.token
          }));

          if (responseData.token) {
            localStorage.setItem('authToken', responseData.token);
          }
          localStorage.removeItem('loginData');

          try {
            const intended = localStorage.getItem('intendedPath');
            if (intended) {
              localStorage.removeItem('intendedPath');
              if (!onNavigate) {
                router.push(intended);
                return;
              }
            }
          } catch { }

          if (onNavigate) onNavigate('home');
          else router.push('/');
        }
      }, 1500);

    } catch (error: any) {
      setIsLoading(false);
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setErrorMessage(msg);
      dispatch(loginFailure(msg));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6) {
      handleProceed();
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E7121B]"></div>
      </div>
    );
  }

  if (!loginData) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-red-50 relative overflow-hidden font-poppins">

      {/* Background Aesthetic Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left large soft glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-20%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,18,27,0.18) 0%, rgba(231,18,27,0) 70%)',
        }} />
        {/* Rotated diamond accent top-right */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '260px', height: '260px',
          background: 'rgba(231,18,27,0.07)',
          transform: 'rotate(45deg)',
          borderRadius: '20px',
        }} />
        {/* Hollow ring top-right */}
        <div style={{
          position: 'absolute', top: '30px', right: '30px',
          width: '180px', height: '180px', borderRadius: '50%',
          border: '2px solid rgba(231,18,27,0.12)',
        }} />
        {/* Bottom-right large soft glow */}
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-20%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,18,27,0.18) 0%, rgba(231,18,27,0) 70%)',
        }} />
        {/* Bottom-left hollow ring */}
        <div style={{
          position: 'absolute', bottom: '40px', left: '20px',
          width: '140px', height: '140px', borderRadius: '50%',
          border: '2px solid rgba(231,18,27,0.10)',
        }} />
        {/* Center-left small diamond */}
        <div style={{
          position: 'absolute', top: '45%', left: '-30px',
          width: '100px', height: '100px',
          background: 'rgba(231,18,27,0.06)',
          transform: 'rotate(45deg)',
          borderRadius: '10px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Back Button */}
        <button
          type="button"
          onClick={navigateBack}
          className="absolute -top-16 left-6 flex items-center text-[#E7121B] hover:text-[#C21011] transition-colors duration-300 font-bold text-sm"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </button>

        {/* Main Card */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-20 h-20 mb-4 bg-red-50 rounded-2xl shadow-sm border border-red-100">
              <Image
                src="/logo.png"
                alt="Game Creds"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2 tracking-tight">
              OTP Verification
            </h1>
            <p className="text-gray-500 text-sm font-medium px-4">
              Enter the 6-digit code sent to
              <br />
              <span className="text-gray-800 font-semibold block mt-1">{loginData.email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                maxLength={6}
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                onKeyDown={handleKeyDown}
                placeholder="000000"
                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-red-200 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all duration-300"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            {errorMessage && (
              <p className="mt-3 text-[#E7121B] text-sm font-medium text-center animate-shake">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoading || isSuccess || otp.length !== 6}
            className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 flex justify-center items-center gap-2 ${isSuccess
              ? 'bg-green-500 text-white'
              : 'bg-[#E7121B] hover:bg-[#C21011] text-white hover:shadow-[#E7121B]/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
          >
            {isSuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verified!</span>
              </>
            ) : isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Code</span>
            )}
          </button>

          {/* Footer Actions */}
          <div className="mt-6 text-center space-y-3">
            <button
              onClick={navigateBack}
              className="text-sm text-gray-500 hover:text-[#E7121B] transition-colors"
            >
              Didn&apos;t receive code? <span className="font-semibold underline decoration-dotted text-[#E7121B]">Resend</span>
            </button>
            <div className="block">
              <button
                onClick={navigateBack}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Change {loginData.isPhoneLogin ? 'Phone Number' : 'Email Address'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
