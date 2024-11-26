import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type HeaderView = 'main' | 'settings' | 'feedback' | 'journals';

interface HeaderContextType {
  isMenuOpen: boolean;
  currentView: HeaderView;
  lastJournalEntryId: string;
  setLastJournalEntryId: (value: string) => void;
  toggleMenu: () => void;
  navigateToView: (view: HeaderView, params?: Record<string, string>) => void;
  goBack: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<HeaderView>(
    (pathName.split('/')[1] as HeaderView) || 'main'
  );
  const [previousView, setPreviousView] = useState<HeaderView | null>(null);
  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');

  const toggleMenu = () => {
    if (currentView === 'settings') {
      goBack();
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const navigateToView = (view: HeaderView, params?: Record<string, string>) => {
    setPreviousView(currentView);
    setCurrentView(view);

    let url = `/${view}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }

    router.push(url);
  };

  const goBack = () => {
    if (previousView) {
      setCurrentView(previousView);
      router.back();
    }
  };

  return (
    <HeaderContext.Provider 
      value={{ 
        isMenuOpen,
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