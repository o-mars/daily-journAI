import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import FeedbackModal from "./FeedbackModal";

interface HeaderProps {
  onMenuClick: () => void;
  onFeedbackClick: () => void;
  isFeedbackOpen: boolean;
  onCloseFeedback: () => void;
  lastJournalEntryId: string;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onFeedbackClick,
  isFeedbackOpen,
  onCloseFeedback,
  lastJournalEntryId
}) => {
  const router = useRouter();

  const handleLogoutClick = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 sticky top-0 z-10">
      <button className="w-8" onClick={onMenuClick}>
        <Image width={32} height={32} src="/icons/menu.svg" alt="Profile" />
      </button>
      <h1 className="text-2xl md:text-4xl font-bold">JournAI</h1>
      <div className="flex">
        <button className="w-7 mr-4" onClick={onFeedbackClick}>
          <Image width={28} height={28} src="/icons/feather-mail.svg" alt="Feedback" />
        </button>
        <button className="w-7" onClick={handleLogoutClick}>
          <Image width={28} height={28} src="/icons/feather-log-out.svg" alt="Logout" />
        </button>
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