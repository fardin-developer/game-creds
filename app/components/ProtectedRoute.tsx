'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthChecker from './AuthChecker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Only run redirect logic on client after mounting
    if (!hasMounted) return;

    // Only redirect if we're not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      const localToken = localStorage.getItem('authToken');
      if (!localToken) {
        try {
          localStorage.setItem('intendedPath', pathname || '/');
        } catch { }
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo, pathname, hasMounted]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#232426' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a token but haven't verified authentication yet, use AuthChecker
  if (token && !isAuthenticated) {
    return <AuthChecker>{children}</AuthChecker>;
  }

  // Check localStorage token as fallback (client-side only) - only after mounting
  if (!isAuthenticated && !token && hasMounted) {
    const localToken = localStorage.getItem('authToken');
    if (localToken) {
      return <AuthChecker>{children}</AuthChecker>;
    }
    return null;
  }

  // During SSR or before client mount, don't render anything for unauthenticated users
  if (!isAuthenticated && !token && !hasMounted) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

