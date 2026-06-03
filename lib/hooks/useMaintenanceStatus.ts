import { useState, useEffect } from 'react';
import apiClient from '../api/axios';

interface MaintenanceResponse {
  success: boolean;
  status: boolean; // true if under maintenance
  message: string;
  timestamp: string;
}

interface MaintenanceStatus {
  isUnderMaintenance: boolean;
  message: string;
  isLoading: boolean;
  error: string | null;
}

export const useMaintenanceStatus = (): MaintenanceStatus => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    isUnderMaintenance: false,
    message: '',
    isLoading: false, // Start as false to not block content
    error: null,
  });

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const response = await apiClient.get<MaintenanceResponse>(
          '/maintenance/status'
        );

        if (response.data.success) {
          setMaintenanceStatus({
            isUnderMaintenance: response.data.status,
            message: response.data.message,
            isLoading: false,
            error: null,
          });
        } else {
          // If success is false, treat it as not under maintenance
          setMaintenanceStatus({
            isUnderMaintenance: false,
            message: '',
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        // If API call fails, allow site to load normally
        console.error('Failed to check maintenance status:', error);
        setMaintenanceStatus({
          isUnderMaintenance: false,
          message: '',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    // Call immediately without blocking
    checkMaintenanceStatus();
  }, []);

  return maintenanceStatus;
};
