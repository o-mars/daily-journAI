"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { brands, defaultBranding } from '@/src/models/brand';
import { Branding } from '@/src/models/brand';
import { useUser } from '@/src/contexts/UserContext';

type HeaderView = 
  | 'main'
  | 'start'
  | 'session'
  | 'settings'
  | 'feedback'
  | 'journals'
  | 'auth'
  | 'welcome'
  | 'journals/:journalEntryId';

interface HeaderContextType {
  isShowingMenuOptions: boolean;
  currentView: HeaderView;
  lastJournalEntryId: string;
  branding: Branding;
  setLastJournalEntryId: (value: string) => void;
  toggleMenu: () => void;
  navigateToView: (view: HeaderView, params?: Record<string, string>) => void;
  goBack: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function getCurrentViewFromPath(pathName: string): HeaderView {
  const paths = pathName.split('/');
  if (paths[1] === 'journals' && paths[2]) {
    return 'journals/:journalEntryId';
  }
  if (paths[1] === 'session') return 'session';
  if (paths[1] === 'welcome') return 'welcome';
  return (paths[1] as HeaderView) || 'main';
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();
  const [currentView, setCurrentView] = useState<HeaderView>(getCurrentViewFromPath(pathName));
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');
  const { clientProvider } = useUser();
  const [isShowingMenuOptions, setIsShowingMenuOptions] = useState(currentView === 'settings' || currentView === 'feedback');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const hostname = window.location.hostname;
    setBranding(brands[hostname] || defaultBranding);
  }, []);

  useEffect(() => {
    const nextView = getCurrentViewFromPath(pathName);
    setCurrentView(nextView);
    
    if (nextView !== currentView) {
      setIsShowingMenuOptions(nextView === 'settings' || nextView === 'feedback');
    }
  }, [pathName, currentView]);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme-preference') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to light theme
      applyTheme('light');
    }
  }, []);

  const applyTheme = (themeValue: 'light' | 'dark') => {
    // Remove any existing theme classes
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    
    // Apply chosen theme
    document.documentElement.setAttribute('data-theme', themeValue);
    document.documentElement.classList.add(`${themeValue}-mode`);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    applyTheme(newTheme);
  };

  const toggleMenu = () => {
    setIsShowingMenuOptions(!isShowingMenuOptions);
    if (currentView === 'settings' || currentView === 'feedback') {
      goBack();
    }
  };

  const navigateToView = (view: HeaderView, params?: Record<string, string>) => {
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

      if (view === currentView && params) {
        window.location.href = url;
      } else {
        router.push(url);
      }
    }
  };

  const goBack = () => {
    if (currentView === 'settings') {
      navigateToView(clientProvider === 'dailybots' ? 'main' : 'start');
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
        goBack,
        theme,
        toggleTheme,
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