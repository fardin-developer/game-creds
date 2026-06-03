'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { checkAuthSuccess, checkAuthFailure } from '@/lib/store/authSlice';
import apiClient from '@/lib/api/axios';

interface AuthCheckerProps {
  children: React.ReactNode;
}

export default function AuthChecker({ children }: AuthCheckerProps) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  
  useEffect(() => {
    let isMounted = true;
    const checkAuthentication = async () => {
      // Check if we have a token in Redux state or localStorage
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

      // Fetch user data whenever we have a token and we are not authenticated yet
      if (authToken && !isAuthenticated) {
        try {
          const response = await apiClient.get('/user/me');
          if (isMounted) {
            const userData = response.data;
            dispatch(checkAuthSuccess(userData));
          }
        } catch (error: any) {
          if (!isMounted) return;
          // Token is invalid or expired
          if (error.response?.status === 401) {
             dispatch(checkAuthFailure('Authentication failed. Please login again.'));
          } else {
             // Just console log network errors, don't dispatch checkAuthFailure (which deletes token from localStorage)
             console.error('Network error during auth check:', error);
          }
        }
      }
    };

    // Run authentication check in background without blocking
    checkAuthentication();
    return () => { isMounted = false; };
  }, [token, isAuthenticated, dispatch]);

  // Always render children immediately (non-blocking)
  // Authentication check runs in parallel in the background
  return <>{children}</>;
}
