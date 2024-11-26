import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { APP_TITLE, ONE_HOUR_MS } from "@/src/models/constants";
import { useState, useEffect } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";

interface HeaderProps {
}

const flipFeature = false;

const Header: React.FC<HeaderProps> = ({
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const { user } = useUser();
  const { isStarted } = useVoiceClient()!;

  const [isMenuOpen, setIsMenuOpen] = useState(pathName === '/settings');
  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');

  // useEffect(() => {
  //   if (isStarted && pathName.includes('/feedback')) router.back();
  // }, [isStarted]);

  useEffect(() => {
    if (!user) return;
    const latestEntry = user?.journalEntries?.[0];
    if (!latestEntry || latestEntry.id === lastJournalEntryId || !latestEntry.endTime) return;
    const entryAge = new Date().getTime() - new Date(latestEntry.endTime).getTime();
    if (entryAge > ONE_HOUR_MS) return;
    setLastJournalEntryId(latestEntry.id);

    // if (isStarted || !pathName.includes('/main') || entryAge > ONE_MINUTE_MS) return;
    // router.push(`/feedback?entryId=${latestEntry.id}`);
  }, [user, router, isStarted]);

  const handleLogoutClick = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (pathName === '/settings') router.back();
  };

  const handleNewClick = () => {
    router.push('/main');
  };

  const handleReadClick = () => {
    router.push('/journals');
  };

  const handleSettingsClick = () => {
    if (pathName === '/settings') router.back();
    else router.push('/settings');
  };

  const handleFeedbackClick = () => {
    if (pathName.includes('/feedback')) {
      console.log('back');
      router.back();
    } else {
      console.log('feedback');
      router.push(`/feedback?entryId=${lastJournalEntryId}&menuOpen=${isMenuOpen}`);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const menuOpen = searchParams.get('menuOpen');
    if (menuOpen === 'true') {
      setIsMenuOpen(true);
    }
  }, []);

  return (
    <header className="relative flex items-center p-4 bg-gray-900 sticky top-0 z-10">
      <div className="flex flex-grow-0">
        {!isMenuOpen && pathName !== '/settings' ? (
          <button className="w-8" onClick={toggleMenu}>
            <Image
              width={32}
              height={32}
              src={"/icons/menu.svg"}
              alt="Menu"
            />
          </button>
        ) : (
          <>
            <button className="w-8 mr-4" onClick={toggleMenu}>
              <Image
                width={32}
                height={32}
                src={"/icons/feather-chevron-left.svg"}
                alt="Menu"
              />
            </button>
            <button className="w-7 mr-4" onClick={handleSettingsClick}>
              <Image 
                width={24} 
                height={24} 
                src="/icons/settings.svg" 
                alt="Settings" 
                className={`${pathName.includes('/settings') ? '' : 'opacity-50'}`} 
              />
            </button>
            <button className="w-7" onClick={handleLogoutClick}>
              <Image width={28} height={28} src="/icons/feather-log-out.svg" alt="Logout" />
            </button>
          </>
        )}
      </div>
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-4xl font-bold">
        {pathName === '/settings' ? 'Settings' : APP_TITLE}
      </h1>
      <div className="flex flex-grow-0 ml-auto">
        <button className="w-7 mr-4" onClick={handleFeedbackClick}>
          <Image 
            width={28} 
            height={28} 
            src="/icons/feather-mail.svg" 
            alt="Feedback" 
            className={`${pathName.includes('/feedback') ? '' : 'opacity-50'}`}
          />
        </button>
        {pathName === '/journals' && flipFeature && (
          <button className="w-7 mr-2" onClick={handleNewClick}>
            <Image 
              width={20} 
              height={20} 
              src="/icons/plus.svg" 
              alt="New"
              className="opacity-50 hover:opacity-100" 
            />
          </button>
        )}
        {pathName === '/main' && flipFeature && (
          <button className="w-7 mr-4" onClick={handleReadClick}>
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