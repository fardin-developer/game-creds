'use client';

import { usePathname, useRouter } from 'next/navigation';
import { IoMdHome } from 'react-icons/io';
import { LuGrid2X2 } from 'react-icons/lu';
import { GiShoppingBag } from 'react-icons/gi';
import { MdNewspaper, MdBarChart } from 'react-icons/md';
import { useEffect, useState, useCallback } from 'react';

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
    { id: 'leaderboard', path: '/leaderboard', icon: MdBarChart, label: 'Rank' },
    { id: 'news', path: '/news', icon: MdNewspaper, label: 'News' },
    { id: 'home', path: '/', icon: IoMdHome, label: 'Home' },
    { id: 'orders', path: '/orders', icon: GiShoppingBag, label: 'Orders' },
    { id: 'profile', path: '/profile', icon: LuGrid2X2, label: 'Profile' },
  ];

  const getInitialIndex = () => {
    const idx = navItems.findIndex(item => item.path === pathname || (pathname === '' && item.path === '/'));
    return idx !== -1 ? idx : 2; // Default to home
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIndex);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

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
      
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        {/* Outer futuristic container */}
        <nav className="backdrop-blur-md bg-white/30 rounded-[32px] p-1.5 flex items-center w-[92vw] max-w-[400px] relative shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/60">
          
          {/* Subtle glowing edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white/60 to-transparent pointer-events-none z-10 rounded-l-[32px]" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white/60 to-transparent pointer-events-none z-10 rounded-r-[32px]" />
          
          {/* Futuristic ambient light */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1/3 h-0.5 bg-linear-to-r from-transparent via-[#E7121B] to-transparent blur-[2px] opacity-40" />

          <div className="flex items-center justify-between w-full relative z-0 px-1">
            {navItems.map((item, index) => {
              const isActive = activeIndex === index;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(index, item)}
                  className={`shrink-0 flex items-center rounded-full transition-all duration-500 ease-out ${
                    isActive 
                      ? 'bg-white/90 pr-5 pl-1.5 h-[48px] shadow-sm ring-1 ring-black/5 z-20 opacity-100' 
                      : 'justify-center w-[48px] h-[48px] hover:bg-white/20 z-10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`flex items-center justify-center rounded-full transition-all duration-500 shrink-0 ${
                    isActive 
                      ? 'w-9 h-9 bg-linear-to-br from-[#E7121B] to-[#C21011] text-white item-glow shadow-md' 
                      : 'w-10 h-10 bg-transparent text-gray-700 hover:text-black hover:bg-gray-200/50'
                  } ${poppedIndex === index ? 'haptic-pop' : ''}`}>
                    <item.icon className={`text-[20px] transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'scale-100'}`} />
                  </div>
                  
                  {/* Label on the right for active item */}
                  <div className={`grid transition-all duration-500 ease-out ${isActive ? 'grid-cols-[1fr] ml-2.5 opacity-100' : 'grid-cols-[0fr] ml-0 opacity-0'}`}>
                    <div className="overflow-hidden flex items-center">
                      <span className="text-[13px] font-bold tracking-wide text-[#E7121B] whitespace-nowrap block">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
