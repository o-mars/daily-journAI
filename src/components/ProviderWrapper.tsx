"use client";

import React from 'react';
import { DailyClientProvider } from '@/src/contexts/DailyClientContext';
import { DailySessionProvider } from '@/src/contexts/DailySessionContext';
import { useUser } from '@/src/contexts/UserContext';

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  const { clientProvider } = useUser();

  if (clientProvider === 'dailybots') {
    return (
      <DailyClientProvider>
        <DailySessionProvider>
          {children}
        </DailySessionProvider>
      </DailyClientProvider>
    );
  }

  return <>{children}</>;
}
