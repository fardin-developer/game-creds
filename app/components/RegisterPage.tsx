'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks/redux';
import { registerStart, registerSuccess, registerFailure } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';

interface RegisterPageProps {
  onNavigate?: (screen: string) => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps = {}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<null | { isPhoneLogin: boolean }>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('loginData');
      let phonePrefilled = false;
      let emailPrefilled = false;

      if (stored) {
        const parsed = JSON.parse(stored) as { email: string; isPhoneLogin: boolean };
        setLoginMethod({ isPhoneLogin: parsed.isPhoneLogin });
        if (parsed.isPhoneLogin) {
          setFormData(prev => ({ ...prev, phone: parsed.email }));
          phonePrefilled = true;
        } else {
          setFormData(prev => ({ ...prev, email: parsed.email }));
          emailPrefilled = true;
        }
      }

      if (!phonePrefilled) {
        const phoneFromLogin = localStorage.getItem('loginPhone');
        if (phoneFromLogin) {
          setFormData(prev => ({ ...prev, phone: phoneFromLogin }));
        }
      }

      if (!emailPrefilled) {
        const emailFromLogin = localStorage.getItem('loginEmail');
        if (emailFromLogin) {
          setFormData(prev => ({ ...prev, email: emailFromLogin }));
        }
      }
    } catch (_) {
      // ignore parsing errors
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    if (!formData.name.trim()) return;
    if (!loginMethod?.isPhoneLogin) {
      if (!formData.phone.trim()) return;
    }
    if (loginMethod?.isPhoneLogin) {
      if (!formData.email.trim()) return;
    } else {
      if (!formData.email.trim()) return;
    }
    if (!formData.password.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginMethod || loginMethod.isPhoneLogin || (!loginMethod && formData.email)) {
      if (!emailRegex.test(formData.email)) return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!loginMethod || !loginMethod.isPhoneLogin) {
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) return;
    }

    setIsLoading(true);
    dispatch(registerStart());

    try {
      const registrationToken = localStorage.getItem('registrationToken');
      if (!registrationToken) {
        dispatch(registerFailure('Verification token missing. Please verify OTP again.'));
        setIsLoading(false);
        return;
      }

      const requestBody = {
        registrationToken,
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      const response = await apiClient.post('/user/complete-registration', requestBody);
      const responseData = response.data;

      dispatch(registerSuccess({
        user: responseData.user,
        token: responseData.token
      }));

      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
      }

      localStorage.removeItem('registrationToken');
      localStorage.removeItem('loginData');

      setTimeout(() => {
        try {
          const intended = localStorage.getItem('intendedPath');
          if (intended) {
            localStorage.removeItem('intendedPath');
            if (onNavigate) {
              onNavigate('home');
            } else {
              router.push(intended);
              return;
            }
          }
        } catch { }
        if (onNavigate) {
          onNavigate('home');
        } else {
          router.push('/');
        }
      }, 1500);
    } catch (error) {
      dispatch(registerFailure('Network error. Please check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-red-50 relative overflow-hidden font-poppins">

      {/* Background Aesthetic Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-20%', left: '-20%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,18,27,0.18) 0%, rgba(231,18,27,0) 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '260px', height: '260px',
          background: 'rgba(231,18,27,0.07)',
          transform: 'rotate(45deg)',
          borderRadius: '20px',
        }} />
        <div style={{
          position: 'absolute', top: '30px', right: '30px',
          width: '180px', height: '180px', borderRadius: '50%',
          border: '2px solid rgba(231,18,27,0.12)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-20%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,18,27,0.18) 0%, rgba(231,18,27,0) 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '40px', left: '20px',
          width: '140px', height: '140px', borderRadius: '50%',
          border: '2px solid rgba(231,18,27,0.10)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', left: '-30px',
          width: '100px', height: '100px',
          background: 'rgba(231,18,27,0.06)',
          transform: 'rotate(45deg)',
          borderRadius: '10px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-20 h-20 mb-4 bg-red-50 rounded-2xl shadow-sm border border-red-100 mx-auto">
            <Image
              src="/logo.png"
              alt="Game Creds"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1 tracking-tight">Create Account</h1>
          <p className="text-gray-500 text-sm font-medium">Fill in your details to get started</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="reg-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-12 pr-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all duration-300"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="reg-phone" className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
              Phone Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                id="reg-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                disabled={!!loginMethod?.isPhoneLogin}
                className="w-full pl-12 pr-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            {loginMethod?.isPhoneLogin && (
              <p className="text-xs text-[#E7121B] ml-1">Prefilled from phone login</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                id="reg-email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                disabled={loginMethod?.isPhoneLogin === false}
                className="w-full pl-12 pr-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            {loginMethod?.isPhoneLogin === false && (
              <p className="text-xs text-[#E7121B] ml-1">Prefilled from email login</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="block text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">
              Create Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E7121B] transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                id="reg-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password"
                className="w-full pl-12 pr-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E7121B] focus:ring-1 focus:ring-[#E7121B] transition-all duration-300"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full py-3.5 bg-[#E7121B] hover:bg-[#C21011] text-white font-bold rounded-xl shadow-lg hover:shadow-[#E7121B]/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up Now</span>
            )}
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('login') : router.push('/login')}
            className="text-[#E7121B] font-semibold hover:text-[#C21011] transition-colors"
          >
            Login Now
          </button>
        </p>

      </div>
    </div>
  );
}
