"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { brands, defaultBranding } from '@/src/models/brand';
import { Branding } from '@/src/models/brand';
import { useUser } from '@/src/contexts/UserContext';
import { ClientProvider } from '@/src/models/user.preferences';

type HeaderView = 'main' | 'start' | 'settings' | 'feedback' | 'journals' | 'auth' | 'journals/:journalEntryId';

interface HeaderContextType {
  isShowingMenuOptions: boolean;
  currentView: HeaderView;
  lastJournalEntryId: string;
  branding: Branding;
  setLastJournalEntryId: (value: string) => void;
  toggleMenu: () => void;
  navigateToView: (view: HeaderView, params?: Record<string, string>) => void;
  goBack: () => void;
}

function getCurrentViewFromPath(pathName: string): HeaderView {
  const paths = pathName.split('/');
  if (paths[1] === 'journals' && paths[2]) {
    return 'journals/:journalEntryId';
  }
  return (paths[1] as HeaderView) || 'main';
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();
  const [currentView, setCurrentView] = useState<HeaderView>(getCurrentViewFromPath(pathName));
  const [previousView, setPreviousView] = useState<HeaderView | null>(null);
  const [branding, setBranding] = useState<Branding>(defaultBranding);

  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');

  const [isShowingMenuOptions, setIsShowingMenuOptions] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const hostname = window.location.hostname;
    setBranding(brands[hostname] || defaultBranding);
  }, []);

  useEffect(() => {
    const nextView = getCurrentViewFromPath(pathName);
    setCurrentView(nextView);
    
    const searchParams = new URLSearchParams(window.location.search);
    const menuParam = searchParams.get('isShowingMenuOptions');
    if (menuParam !== null) {
      setIsShowingMenuOptions(menuParam === 'true');
    } else {
      setIsShowingMenuOptions(nextView === 'settings');
    }
  }, [pathName]);

  const toggleMenu = () => {
    setIsShowingMenuOptions(!isShowingMenuOptions);
    if (currentView === 'settings' || currentView === 'feedback') {
      goBack();
    }
  };

  const navigateToView = (view: HeaderView, params?: Record<string, string>) => {
    setPreviousView(currentView);
    setCurrentView(view);

    if (view === 'journals/:journalEntryId' && params?.journalEntryId) {
      setLastJournalEntryId(params.journalEntryId);
      router.push(`/journals/${params.journalEntryId}`);
    } else {
      let url = `/${view}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value);
        });
        url += `?${searchParams.toString()}`;
      }
  
      router.push(url);
    }

  };

  const goBack = () => {
    if (currentView === 'settings') {
      const envProvider: ClientProvider = process.env.NEXT_PUBLIC_PROVIDER === 'hume' ? 'hume' : user?.preferences.provider || 'dailybots';
      const clientProvider: ClientProvider = envProvider;

      if (previousView === 'main' && clientProvider === 'hume') {
        navigateToView('start');
      } else if (previousView === 'start' && clientProvider === 'dailybots') {
        navigateToView('main');
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <HeaderContext.Provider 
      value={{ 
        branding,
        isShowingMenuOptions,
        currentView,
        lastJournalEntryId,
        setLastJournalEntryId,
        toggleMenu,
        navigateToView,
        goBack
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
} 