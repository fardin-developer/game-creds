'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks/redux';
import { loginStart, loginFailure, clearError } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';

interface LoginPageProps {
  onNavigate?: (screen: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone'); // Phone is default
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Reset loading state immediately when component mounts
  useEffect(() => {
    setIsLoading(false);
    dispatch(loginFailure(''));
    dispatch(clearError());
  }, [dispatch]);

  // Handle browser back button - prevent navigation outside app
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      if (onNavigate) {
        onNavigate('home');
      } else {
        router.push('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, onNavigate]);

  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (loginMethod === 'phone' && !phone.trim()) return;
    if (loginMethod === 'email' && !email.trim()) return;

    setIsLoading(true);
    setLoginError('');
    dispatch(loginStart());

    try {
      const requestBody = loginMethod === 'phone' ? { phone } : { email };
      const response = await apiClient.post('/user/send-otp', requestBody);

      if (response.data) {
        const loginValue = loginMethod === 'phone' ? phone : email;
        localStorage.setItem('loginData', JSON.stringify({
          email: loginValue,
          isPhoneLogin: loginMethod === 'phone'
        }));

        if (loginMethod === 'phone') {
          localStorage.setItem('loginPhone', phone);
        } else {
          localStorage.setItem('loginEmail', email);
        }

        if (onNavigate) {
          onNavigate('otp-verification');
        } else {
          router.push('/otp-verification');
        }
      }
    } catch (error: any) {
      let msg = 'Failed to send OTP';
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (typeof error?.response?.data === 'string') {
        try {
          const parsed = JSON.parse(error.response.data);
          if (parsed.message) msg = parsed.message;
          else msg = error.response.data;
        } catch {
          msg = error.response.data;
        }
      } else if (error?.message) {
        msg = error.message;
      }
      setLoginError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Rotated diamond / rhombus accent top-right */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '260px', height: '260px',
          background: 'rgba(231,18,27,0.07)',
          transform: 'rotate(45deg)',
          borderRadius: '20px',
        }} />
        {/* Hollow ring top-right corner */}
        <div style={{
          position: 'absolute', top: '30px', right: '30px',
          width: '180px', height: '180px', borderRadius: '50%',
          border: '2px solid rgba(231,18,27,0.12)',
        }} />
        {/* Small filled circle accent */}
        <div style={{
          position: 'absolute', top: '120px', right: '80px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(231,18,27,0.08)',
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
          onClick={() => onNavigate ? onNavigate('home') : router.push('/')}
          className="absolute -top-16 left-6 flex items-center text-[#E7121B] hover:text-[#C21011] transition-colors duration-300 font-bold text-sm"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Main Card */}
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-3xl shadow-xl p-8 backdrop-blur-sm">

          {/* Header Section */}
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
            <h1 className="text-3xl font-semibold text-gray-800 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Sign in to continue to <span className="text-gray-800">Game Creds</span>
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex p-1 mb-8 bg-red-50 rounded-xl border border-red-100">
            {(['phone', 'email'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setLoginMethod(method);
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 capitalize ${loginMethod === method
                  ? 'bg-[#E7121B] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#E7121B]'
                  }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="login-input"
                className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1"
              >
                {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors duration-300">
                  {loginMethod === 'phone' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  )}
                </div>
                <input
                  id="login-input"
                  type={loginMethod === 'phone' ? 'tel' : 'email'}
                  value={loginMethod === 'phone' ? phone : email}
                  onChange={(e) => loginMethod === 'phone' ? setPhone(e.target.value) : setEmail(e.target.value)}
                  placeholder={loginMethod === 'phone' ? 'Enter phone number' : 'Enter email address'}
                  className="w-full pl-12 pr-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-[#010102] placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all duration-300"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#E7121B] text-sm font-medium text-center animate-shake">
                {loginError}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-[#E7121B] hover:bg-[#C21011] text-white font-bold rounded-xl shadow-lg hover:shadow-[#E7121B]/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending Code...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-8 text-gray-500 text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}