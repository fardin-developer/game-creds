'use client';

import React, { ReactNode } from 'react';
import { useMaintenanceStatus } from '@/lib/hooks/useMaintenanceStatus';
import MaintenancePage from './MaintenancePage';

interface MaintenanceCheckerProps {
  children: ReactNode;
}

const MaintenanceChecker: React.FC<MaintenanceCheckerProps> = ({ children }) => {
  const { isUnderMaintenance, message, isLoading } = useMaintenanceStatus();

  // Always render children immediately (non-blocking)
  // Only show maintenance page if confirmed under maintenance (not during loading)
  if (isUnderMaintenance && !isLoading) {
    return <MaintenancePage message={message} />;
  }

  // Render the children (normal site content)
  return <>{children}</>;
};

export default MaintenanceChecker;
