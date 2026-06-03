'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { logout } from '@/lib/store/authSlice';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('authToken');
    onClose();
    if (onNavigate) {
      onNavigate('login');
    } else {
      router.push('/login');
    }
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home',
      path: '/',
      isActive: true
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
      path: '/profile',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      label: 'Orders',
      path: '/orders',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Leaderboards',
      path: '/leaderboard',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'Add Coins',
      path: '/addcoin',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
      ),
      label: 'WhatsApp Us',
      path: '/contact',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Refund Policy',
      path: '/refund',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: 'Terms & Conditions',
      path: '/terms',
      isActive: false
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: 'Privacy Policy',
      path: '/privacy',
      isActive: false
    }
  ];

  const getScreenName = (path: string) => {
    const screenMap: { [key: string]: string } = {
      '/': 'home',
      '/profile': 'profile',
      '/orders': 'orders',
      '/leaderboard': 'leaderboard',
      '/addcoin': 'addcoin',
      '/contact': 'contact',
      '/refund': 'refund',
      '/terms': 'terms',
      '/privacy': 'privacy',
    };
    return screenMap[path] || path;
  };

  const handleMenuItemClick = (path: string) => {
    // Special handling for WhatsApp Us
    if (path === '/contact') {
      onClose();
      window.open('https://wa.me/9707315156', '_blank');
      return;
    }

    const screenName = getScreenName(path);
    onClose();
    if (onNavigate) {
      onNavigate(screenName);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Backdrop - Only render when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={onClose}
        />
      )}

      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-2/3 max-w-sm z-60 rounded-r-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${!isOpen ? 'pointer-events-none' : ''}`}
        style={{ backgroundColor: '#FFF5F5' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-100">
          <div>
            <h2 className="text-[#010102] font-bold text-lg">Welcome,</h2>
            <p className="text-[#E7121B] font-bold text-lg">{user?.name || 'Username'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white shadow-sm border border-red-100 flex items-center justify-center hover:bg-red-50"
          >
            <svg className="w-5 h-5 text-[#010102]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-4 flex flex-col h-full">
          <div className="flex-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item.path)}
                className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-red-50 transition-all duration-200 ease-in-out transform hover:scale-[1.02]`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen ? `slideInFromLeft 0.3s ease-out forwards` : 'none',
                  backgroundColor: item.isActive ? '#E7121B' : 'transparent',
                  color: item.isActive ? '#FFFFFF' : '#010102'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-current">
                    {item.icon}
                  </div>
                  <span className="font-medium text-current">{item.label}</span>
                </div>
                <svg className="w-5 h-5 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Login/Logout Button - Always at the bottom, independent of menu items */}
          <div className="mt-auto pb-6 px-6 relative z-10">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-[#E7121B] text-[#E7121B] font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-[#E7121B] hover:text-white"
                style={{
                  animationDelay: '600ms',
                  animation: isOpen ? `slideInFromLeft 0.3s ease-out forwards` : 'none'
                }}
              >
                <span>Log Out</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigate) {
                    onNavigate('login');
                  } else {
                    router.push('/login');
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-[#E7121B] text-white bg-[#E7121B] font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-[#C21011] hover:border-[#C21011] shadow-lg"
                style={{
                  animationDelay: '600ms',
                  animation: isOpen ? `slideInFromLeft 0.3s ease-out forwards` : 'none'
                }}
              >
                <span>Log In</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
