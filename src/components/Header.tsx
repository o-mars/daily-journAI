"use client";

import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { ONE_HOUR_MS } from "@/src/models/constants";
import { useEffect } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { useHeader } from '@/src/contexts/HeaderContext';
import { RTVIClientAudio } from "realtime-ai-react";
import { ClientProvider } from "@/src/models/user.preferences";

const Header: React.FC = () => {
  const { user } = useUser();
  const provider: ClientProvider = process.env.NEXT_PUBLIC_PROVIDER === 'hume' ? 'hume' : user?.preferences.provider || 'dailybots';
  const {
    branding,
    isShowingMenuOptions,
    currentView,
    lastJournalEntryId,
    setLastJournalEntryId,
    toggleMenu,
    navigateToView,
    goBack
  } = useHeader();

  useEffect(() => {
    if (!user) return;
    const latestEntry = user?.journalEntries?.[0];
    if (!latestEntry || latestEntry.id === lastJournalEntryId || !latestEntry.endTime) return;
    const entryAge = new Date().getTime() - new Date(latestEntry.endTime).getTime();
    if (entryAge > ONE_HOUR_MS) return;
    setLastJournalEntryId(latestEntry.id);
  }, [user, lastJournalEntryId, setLastJournalEntryId]);

  const handleLogoutClick = async () => {
    await signOut(auth);
    navigateToView('auth');
  };

  const handleFeedbackClick = () => {
    if (currentView === 'feedback') {
      goBack();
    } else {
      navigateToView('feedback', {
        entryId: lastJournalEntryId,
        isShowingMenuOptions: isShowingMenuOptions.toString() 
      });
    }
  };

  const handleSettingsClick = () => {
    if (currentView === 'settings') {
      toggleMenu();
    } else {
      navigateToView('settings', {
        isShowingMenuOptions: isShowingMenuOptions.toString() 
      });
    }
  };

  return (
    <header className="relative flex items-center p-4 bg-gray-900 sticky top-0 z-10">
      <RTVIClientAudio />

      <div className="flex flex-grow-0">

        {!isShowingMenuOptions ? (
          <button className="w-8" onClick={toggleMenu} title="Menu">
            <Image width={32} height={32} src="/icons/menu.svg" alt="Menu" />
          </button>
        ) : (
          <button className="w-8 mr-2" onClick={toggleMenu} title="Back">
            <Image width={32} height={32} src="/icons/feather-chevron-left.svg" alt="Back" />
          </button>
        )}

        {isShowingMenuOptions && (
          <>
            <button className="w-7 mr-3" onClick={handleSettingsClick} title="Settings">
              <Image
                  width={24}
                  height={24}
                  src="/icons/settings.svg"
                  alt="Settings"
                  className={`${currentView === 'settings' ? '' : 'opacity-50'}`}
                />
            </button>
            <button className="w-7 mr-4" onClick={handleFeedbackClick} title="Feedback">
              <Image
                width={28}
                height={28}
                src="/icons/feather-mail.svg"
                alt="Feedback"
                className={`${currentView === 'feedback' ? '' : 'opacity-50'}`}
              />
            </button>
            <button className="w-7" onClick={handleLogoutClick} title="Logout">
              <Image
                width={28}
                height={28}
                src="/icons/feather-log-out.svg"
                alt="Logout"
                className={`${currentView === 'auth' ? '' : 'opacity-50'}`}
              />
            </button>
          </>
        )}
      </div>
      <h1 className={`absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-4xl font-bold select-none ${
        isShowingMenuOptions ? 'hidden-on-small' : ''
      }`}>
        {currentView === 'settings' ? 'Settings' : branding.appName}
      </h1>
      <div className="flex flex-grow-0 ml-auto">
        {(currentView === 'journals') && (
          <button 
            className="w-7" 
            onClick={() => navigateToView(provider === 'hume' ? 'start' : 'main', { autoConnect: 'true' })}
            title="Start"
          >
            <Image
              width={28}
              height={28}
              src="/icons/chat-plus-corner-thick.png"
              alt="New"
              className="opacity-50 hover:opacity-100"
            />
          </button>
        )}
        {(currentView === 'start' || currentView === 'journals/:journalEntryId') && (
          <button className="w-7" onClick={() => navigateToView('journals')}>
            <Image
              width={26}
              height={26}
              src="/icons/book-white.png"
              alt="Read"
              className="opacity-50 hover:opacity-100"
            />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 