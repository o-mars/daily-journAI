'use client';

import React, { useEffect } from 'react';
import { useHeader } from '@/src/contexts/HeaderContext';
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';
import { CHECK_EMAIL_MESSAGE } from '@/src/models/constants';
import { useUser } from '@/src/contexts/UserContext';

const CheckEmailPage = () => {
  const { branding } = useHeader();
  const { user, isInitialized } = useUser();
  const statusRef = React.useRef<StatusIndicatorHandle>(null);
  
  useEffect(() => {
    statusRef.current?.pushMessage({ type: 'info', text: CHECK_EMAIL_MESSAGE });
  }, []);

  useEffect(() => {
    if (isInitialized && !!user) {
      window.close();
    }
  }, [isInitialized, user]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">{branding.appName}</h1>
        </div>

        <StatusIndicator
          ref={statusRef}
          className="text-white"
        />

        <div className="text-center w-full h-auto">
          <img src={branding.appIcon} alt={`${branding.appName} Logo`} />
        </div>
      </div>
    </main>
  );
};

export default CheckEmailPage; 