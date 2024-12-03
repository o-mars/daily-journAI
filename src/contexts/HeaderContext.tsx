import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type HeaderView = 'main' | 'settings' | 'feedback' | 'journals' | 'journal-detail';

interface HeaderContextType {
  isShowingMenuOptions: boolean;
  currentView: HeaderView;
  lastJournalEntryId: string;
  setLastJournalEntryId: (value: string) => void;
  toggleMenu: () => void;
  navigateToView: (view: HeaderView, params?: Record<string, string>) => void;
  goBack: () => void;
}

function getCurrentViewFromPath(pathName: string): HeaderView {
  const paths = pathName.split('/');
  if (paths[1] === 'journals' && paths[2]) {
    return 'journal-detail';
  }
  return (paths[1] as HeaderView) || 'main';
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathName = usePathname();
  const [currentView, setCurrentView] = useState<HeaderView>(getCurrentViewFromPath(pathName));
  const [previousView, setPreviousView] = useState<HeaderView | null>(null);

  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');

  const [isShowingMenuOptions, setIsShowingMenuOptions] = useState(false);

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