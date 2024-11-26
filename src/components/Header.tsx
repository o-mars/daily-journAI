import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { APP_TITLE, ONE_HOUR_MS } from "@/src/models/constants";
import { useEffect } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { useHeader } from '@/src/contexts/HeaderContext';


const flipFeature = false;

const Header: React.FC = () => {
  const { user } = useUser();
  const { 
    isMenuOpen, 
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
    navigateToView('main');
  };

  const handleFeedbackClick = () => {
    if (currentView === 'feedback') {
      goBack();
    } else {
      navigateToView('feedback', { 
        entryId: lastJournalEntryId, 
        menuOpen: isMenuOpen.toString() 
      });
    }
  };

  return (
    <header className="relative flex items-center p-4 bg-gray-900 sticky top-0 z-10">
      <div className="flex flex-grow-0">
        {!isMenuOpen && currentView !== 'settings' ? (
          <button className="w-8" onClick={toggleMenu}>
            <Image width={32} height={32} src="/icons/menu.svg" alt="Menu" />
          </button>
        ) : (
          <>
            <button className="w-8 mr-4" onClick={toggleMenu}>
              <Image width={32} height={32} src="/icons/feather-chevron-left.svg" alt="Back" />
            </button>
            <button className="w-7 mr-4" onClick={() => navigateToView('settings')}>
              <Image 
                width={24} 
                height={24} 
                src="/icons/settings.svg" 
                alt="Settings" 
                className={`${currentView === 'settings' ? '' : 'opacity-50'}`} 
              />
            </button>
            <button className="w-7" onClick={handleLogoutClick}>
              <Image width={28} height={28} src="/icons/feather-log-out.svg" alt="Logout" />
            </button>
          </>
        )}
      </div>
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-4xl font-bold">
        {currentView === 'settings' ? 'Settings' : APP_TITLE}
      </h1>
      <div className="flex flex-grow-0 ml-auto">
        <button className="w-7 mr-4" onClick={handleFeedbackClick}>
          <Image 
            width={28} 
            height={28} 
            src="/icons/feather-mail.svg" 
            alt="Feedback" 
            className={`${currentView === 'feedback' ? '' : 'opacity-50'}`}
          />
        </button>
        {currentView === 'journals' && flipFeature && (
          <button className="w-7 mr-2" onClick={() => navigateToView('main')}>
            <Image 
              width={20} 
              height={20} 
              src="/icons/plus.svg" 
              alt="New"
              className="opacity-50 hover:opacity-100" 
            />
          </button>
        )}
        {currentView === 'main' && flipFeature && (
          <button className="w-7 mr-4" onClick={() => navigateToView('journals')}>
            <Image 
              width={26} 
              height={26} 
              src="/icons/bookmark.png" 
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