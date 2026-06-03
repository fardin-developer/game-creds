'use client';

import { usePathname } from 'next/navigation';
import BottomNavigation from './BottomNavigation';

export default function NavigationWrapper() {
  const pathname = usePathname();
  
  // Routes where BottomNavigation should NOT be shown
  const hiddenRoutes = ['/login', '/register', '/otp-verification', '/checkout', '/topup', '/order-status'];
  
  // Check if current path starts with any of the hidden routes
  const shouldHide = hiddenRoutes.some(route => pathname?.startsWith(route));
  
  if (shouldHide) {
    return null;
  }
  
  return <BottomNavigation />;
}
