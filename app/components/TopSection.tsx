'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack } from 'react-icons/md';

interface TopSectionProps {
  title?: string;
  showLogo?: boolean;
  showNavigation?: boolean;
  onNavigate?: (screen: string) => void;
}

export default function TopSection({
  title = "Dashboard",
  showLogo = false,
  showNavigation = true,
  onNavigate
}: TopSectionProps) {
  const router = useRouter();
  const [balance] = useState(250);

  const handleHomeClick = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      router.push('/');
    }
  };

  if (showLogo) {
    return (
      <div className="px-4 md:px-6 lg:px-8 relative">
        {/* Top Color Effect */}
        <div
          className="absolute top-0 left-0 right-0 h-20 sm:h-28 z-0"
          style={{
            background: 'linear-gradient(180deg, rgba(231, 18, 27, 0.18) 0%, transparent 100%)'
          }}
        />

        {/* Compact Header Bar */}
        <div className="relative z-10 pt-4 pb-3 flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(231, 18, 27, 0.12)',
              border: '1.5px solid rgba(231, 18, 27, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <MdArrowBack size={22} color="#E7121B" />
          </button>

          {/* Centered Logo */}
          <button
            onClick={handleHomeClick}
            className="hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2"
          >
            <Image
              src="/logo9.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </button>

          {/* Spacer to keep logo centered */}
          <div style={{ width: '42px', flexShrink: 0 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 pt-12">
      {/* Menu Icon */}
      <div className="w-6 h-6 flex flex-col justify-center">
        <div className="w-full h-0.5 bg-white mb-1"></div>
        <div className="w-full h-0.5 bg-white mb-1"></div>
        <div className="w-full h-0.5 bg-white"></div>
      </div>

      {/* Page Title */}
      <div className="flex items-center">
        <h1 className="text-white text-xl font-bold">{title}</h1>
      </div>

      {/* User Profile & Balance */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#232426' }}>
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex items-center bg-yellow-500 rounded-full px-2 py-1">
          <span className="text-black font-bold text-xs">{balance}</span>
          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'black' }}>
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          <span className="text-black font-bold text-xs ml-1">+</span>
        </div>
      </div>
    </div>
  );
}
