'use client';

import React from 'react';

interface MaintenancePageProps {
  message: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance Icon */}
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-yellow-500 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Under Maintenance
        </h1>

        {/* Message */}
        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-6">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">We'll be back soon</span>
        </div>

        {/* Footer */}
        <p className="text-slate-400 text-sm">
          Thank you for your patience. We're working hard to bring everything back online.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
