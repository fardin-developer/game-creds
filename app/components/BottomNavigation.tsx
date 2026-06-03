'use client';

import { usePathname, useRouter } from 'next/navigation';
import { IoMdHome } from 'react-icons/io';
import { LuGrid2X2 } from 'react-icons/lu';
import { GiShoppingBag } from 'react-icons/gi';
import { MdNewspaper, MdBarChart } from 'react-icons/md';
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<NodeJS.Timeout | null>(null);

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
      scrollToIndex(idx, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    
    // Find the child element and use its offsetLeft to center it perfectly
    const child = container.children[index] as HTMLElement;
    if (child) {
      isProgrammaticScroll.current = true;
      if (programmaticScrollTimeout.current) {
        clearTimeout(programmaticScrollTimeout.current);
      }

      const scrollLeft = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: smooth ? 'smooth' : 'auto' });

      programmaticScrollTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, smooth ? 400 : 50);
    }
  }, []);

  // Initial scroll to center on mount
  useEffect(() => {
    // Scroll instantly on mount to prevent jumping/flickering
    scrollToIndex(getInitialIndex(), false);
    
    const timeoutId = setTimeout(() => {
      isMounted.current = true;
    }, 150);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!isMounted.current || isProgrammaticScroll.current) return;
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const centerPosition = container.scrollLeft + container.clientWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;

    // Find the item closest to the center
    Array.from(container.children).forEach((child, index) => {
      const itemElement = child as HTMLElement;
      const itemCenter = itemElement.offsetLeft + itemElement.clientWidth / 2;
      const distance = Math.abs(centerPosition - itemCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
      fireHapticPop(closestIndex);
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      // Auto-navigate only when scrolling has fully stopped
      const targetPath = navItems[closestIndex].path;
      if (targetPath !== pathname) {
        if (onNavigate) {
          onNavigate(navItems[closestIndex].id);
        } else {
          router.push(targetPath);
        }
      }
    }, 350); // Increased debounce to 350ms to ensure scroll has stopped and snap completed
  };

  const handleItemClick = (index: number, item: typeof navItems[0]) => {
    if (activeIndex === index) return;

    fireHapticPop(index);
    setActiveIndex(index);
    scrollToIndex(index, true);

    // Slight delay to allow the smooth scroll animation to start before the page unmounts
    setTimeout(() => {
      if (onNavigate) {
        onNavigate(item.id);
      } else {
        router.push(item.path);
      }
    }, 150);
  };

  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .item-glow {
          box-shadow: 0 0 16px rgba(231, 18, 27, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.4);
        }

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
      `}</style>
      
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
        {/* Outer futuristic container */}
        <nav className="backdrop-blur-md rounded-[32px] p-1 flex items-center w-[290px] sm:w-[280px] relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60">
          
          {/* Subtle glowing edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-white/90 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-white/90 to-transparent pointer-events-none z-10" />
          
          {/* Futuristic ambient light */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1/3 h-0.5 bg-linear-to-r from-transparent via-[#E7121B] to-transparent blur-[2px] opacity-40" />

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-1.5 w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar relative"
            style={{
              // Padding left and right allows the first and last items to be centered.
              // Item width is 44px, so 22px half width
              paddingLeft: 'calc(50% - 22px)',
              paddingRight: 'calc(50% - 22px)',
            }}
          >
            {navItems.map((item, index) => {
              const isActive = activeIndex === index;
              // Calculate distance from center to determine scale for nearby items
              const dist = Math.abs(activeIndex - index);
              let scaleClass = 'scale-75 opacity-60';
              if (isActive) scaleClass = 'scale-110 opacity-100 z-20';
              else if (dist === 1) scaleClass = 'scale-90 opacity-90 z-10';

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(index, item)}
                  className={`shrink-0 snap-center flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 w-[47px] h-[52px] ${scaleClass}`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-linear-to-b from-[#E7121B] to-[#C21011] text-white item-glow mb-0.5 shadow-sm' 
                      : 'bg-gray-300 text-gray-600 hover:text-gray-800'
                  } ${poppedIndex === index ? 'haptic-pop' : ''}`}>
                    <item.icon className={`text-[16px] ${isActive ? 'drop-shadow-md' : ''}`} />
                  </div>
                  
                  {/* Small text at bottom */}
                  <div className="h-2 flex items-center justify-center relative">
                    <span className={`text-[8px] font-bold tracking-wider transition-all duration-300 absolute ${
                      isActive ? 'text-[#E7121B] translate-y-0 opacity-100' : 'text-gray-500 -translate-y-2 opacity-0'
                    }`}>
                      {item.label}
                    </span>
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
