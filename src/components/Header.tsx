import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import FeedbackModal from "./FeedbackModal";
import { APP_TITLE } from "@/src/models/constants";
import { useState } from "react";

interface HeaderProps {
  // onMenuClick: () => void;
  onFeedbackClick: () => void;
  isFeedbackOpen: boolean;
  onCloseFeedback: () => void;
  lastJournalEntryId: string;
}

const flipFeature = false;

const Header: React.FC<HeaderProps> = ({
  // onMenuClick,
  onFeedbackClick,
  isFeedbackOpen,
  onCloseFeedback,
  lastJournalEntryId
}) => {
  const router = useRouter();
  const pathName = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    // router.push('/feedback');
    onFeedbackClick();
  };

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
              <Image width={24} height={24} src="/icons/settings.svg" alt="Settings" />
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
          <Image width={28} height={28} src="/icons/feather-mail.svg" alt="Feedback" />
        </button>
        {pathName === '/journals' && flipFeature && (
          <button className="w-7 mr-2" onClick={handleNewClick}>
            <Image width={20} height={20} src="/icons/plus.svg" alt="New" />
          </button>
        )}
        {pathName === '/main' && flipFeature && (
          <button className="w-7 mr-4" onClick={handleReadClick}>
            <Image width={26} height={26} src="/icons/bookmark.png" alt="Read" />
          </button>
        )}
      </div>
      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={onCloseFeedback}
          lastJournalEntryId={lastJournalEntryId}
        />
      )}
    </header>
  );
};

export default Header; 