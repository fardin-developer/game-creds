'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { IoMdHome } from 'react-icons/io';
import { LuGrid2X2 } from 'react-icons/lu';
import { GiShoppingBag } from 'react-icons/gi';
import { MdNewspaper, MdBarChart } from 'react-icons/md';
import { FaUserCircle, FaHeadset, FaGift } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';

// Triggers native vibration on Android; iOS uses visual spring animation instead
function triggerHaptic() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(8);
  }
}

interface BottomNavigationProps {
  onNavigate?: (screen: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { id: 'support', path: '/support', icon: FaHeadset, label: 'Support' },
    { id: 'purchase', path: '/orders', icon: GiShoppingBag, label: 'Purchase' },
    { id: 'home', path: '/', icon: IoMdHome, label: 'Home' },
    { id: 'giftcards', path: '/giftcards', icon: FaGift, label: 'Gift Cards' },
    { id: 'profile', path: '/profile', icon: LuGrid2X2, label: 'Profile' },
  ];

  const getInitialIndex = () => {
    const idx = navItems.findIndex(item => item.path === pathname || (pathname === '' && item.path === '/'));
    return idx !== -1 ? idx : 2; // Default to home
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIndex);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const fireHapticPop = useCallback((index: number) => {
    triggerHaptic();
    setPoppedIndex(index);
    setTimeout(() => setPoppedIndex(null), 320);
  }, []);

  // Sync activeIndex when pathname changes from outside
  useEffect(() => {
    const idx = getInitialIndex();
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleItemClick = (index: number, item: typeof navItems[0]) => {
    if (activeIndex === index) return;

    fireHapticPop(index);
    setActiveIndex(index);

    if (onNavigate) {
      onNavigate(item.id);
    } else {
      router.push(item.path);
    }
  };

  return (
    <>
      <style jsx>{`
        /* Spring pop — simulates haptic on iOS, complements vibration on Android */
        @keyframes hapticPop {
          0%   { transform: scale(1); }
          25%  { transform: scale(0.80); }
          55%  { transform: scale(1.22); }
          75%  { transform: scale(0.94); }
          90%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .haptic-pop {
          animation: hapticPop 0.32s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        .item-glow {
          box-shadow: 0 0 16px rgba(231, 18, 27, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.4);
        }
      `}</style>
      
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/60 backdrop-blur-xl border-t border-white/60 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] rounded-t-[32px] pt-2 pb-5 px-3">
        <div className="mx-auto flex items-center justify-between gap-3 w-full max-w-[400px]">
        {/* Outer futuristic container */}
        <nav className="bg-white/40 rounded-[32px] p-1 flex items-center flex-1 relative shadow-sm border border-white/60 h-[52px]">
          
          {/* Subtle glowing edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white/60 to-transparent pointer-events-none z-10 rounded-l-[32px]" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white/60 to-transparent pointer-events-none z-10 rounded-r-[32px]" />
          
          {/* Futuristic ambient light */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1/3 h-0.5 bg-linear-to-r from-transparent via-[#E7121B] to-transparent blur-[2px] opacity-40" />

          <div className="flex items-center justify-between w-full relative z-0 px-1">
            {navItems.slice(0, 4).map((item, index) => {
              const isActive = activeIndex === index;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(index, item)}
                  className={`shrink-0 flex items-center rounded-full transition-all duration-500 ease-out ${
                    isActive 
                      ? 'bg-white/90 pr-4 pl-1 h-[40px] shadow-sm ring-1 ring-black/5 z-20 opacity-100' 
                      : 'justify-center w-[40px] h-[40px] hover:bg-white/20 z-10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`flex items-center justify-center rounded-full transition-all duration-500 shrink-0 ${
                    isActive 
                      ? 'w-8 h-8 bg-linear-to-br from-[#E7121B] to-[#C21011] text-white item-glow shadow-md' 
                      : 'w-9 h-9 bg-transparent text-gray-700 hover:text-black hover:bg-gray-200/50'
                  } ${poppedIndex === index ? 'haptic-pop' : ''}`}>
                    <item.icon className={`text-[18px] transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'scale-100'}`} />
                  </div>
                  
                  {/* Label on the right for active item */}
                  <div className={`grid transition-all duration-500 ease-out ${isActive ? 'grid-cols-[1fr] ml-2 opacity-100' : 'grid-cols-[0fr] ml-0 opacity-0'}`}>
                    <div className="overflow-hidden flex items-center">
                      <span className="text-[12px] font-bold tracking-wide text-[#E7121B] whitespace-nowrap block">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Profile Circle */}
        {(() => {
          const profileIndex = 4;
          const profileItem = navItems[profileIndex];
          const isActive = activeIndex === profileIndex;

          return (
            <button
              onClick={() => handleItemClick(profileIndex, profileItem)}
              className={`shrink-0 flex items-center justify-center rounded-full relative shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-[2px] transition-all duration-500 ease-out overflow-hidden w-[46px] h-[46px] ${
                isActive 
                  ? 'border-white/90 bg-linear-to-br from-[#E7121B] to-[#C21011] text-white item-glow' 
                  : 'border-white/60 backdrop-blur-md bg-white/30 text-gray-700 hover:text-black hover:bg-white/50'
              } ${poppedIndex === profileIndex ? 'haptic-pop' : ''}`}
            >
              {isAuthenticated && user?.profilePicture && !imgError ? (
                <Image
                  src={user.profilePicture}
                  alt="Profile"
                  width={46}
                  height={46}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#E7121B] to-[#C21011] text-white">
                  <FaUserCircle className={`text-[22px] transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'scale-100'}`} />
                </div>
              )}
            </button>
          );
        })()}
        </div>
      </div>
    </>
  );
}
