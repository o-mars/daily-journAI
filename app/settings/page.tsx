"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';

import { useUser } from "@/src/contexts/UserContext";
import Header from "@/src/components/Header";
import { defaultUser } from "@/src/models/user";
import { CHECK_EMAIL_MESSAGE } from "@/src/models/constants";
import InputWithButton from "@/src/components/InputWithButton";
import { isValidEmail, sendMagicLink } from "@/src/services/authService";
import ConfirmationModal from "@/src/components/ConfirmationModal";
import { useRouter } from 'next/navigation';
import { deleteAllJournalEntries, deleteUser } from "@/src/client/firebase.service.client";
import { signOut } from "@/src/services/authService";
import { trackEvent } from "@/src/services/metricsSerivce";

export default function Settings() {
  const { user, syncLocalUser } = useUser();

  const statusRef = useRef<StatusIndicatorHandle>(null);

  const [localUser, setLocalUser] = useState(defaultUser);

  const [emailToConnect, setEmailToConnect] = useState<string>('');

  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'entries' | 'account' | null>(null);

  useEffect(() => {
    if (user) {
      setLocalUser(prevUser => ({
        ...prevUser,
        ...user
      }));
    }
  }, [user]);

  const handleSendMagicLink = useCallback(async () => {
    if (!isValidEmail(emailToConnect)) {
      statusRef.current?.pushMessage({ type: 'error', text: "Please enter a valid email address" });
      return;
    }

    if (!user) {
      statusRef.current?.pushMessage({ type: 'error', text: "User not logged in" });
      return;
    }

    await sendMagicLink(emailToConnect, user.userId);
    statusRef.current?.pushMessage({ type: 'info', text: CHECK_EMAIL_MESSAGE });
  }, [emailToConnect, user, statusRef]);

  const handleDeleteAllEntries = useCallback(() => {
    setDeleteType('entries');
    setModalOpen(true);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    setDeleteType('account');
    setModalOpen(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    setModalOpen(false);
    setDeleteType(null);
    try {
      if (deleteType === 'entries') {
        await deleteAllJournalEntries();
        trackEvent("journals", "all-journal-deleted", { userId: user?.userId });
        await syncLocalUser();
        statusRef.current?.pushMessage({ type: 'success', text: 'All journal entries deleted successfully' });
      } else if (deleteType === 'account') {
        await deleteUser();
        trackEvent("auth", "account-deleted", { userId: user?.userId });
        statusRef.current?.pushMessage({ type: 'success', text: 'Account deleted successfully' });
        await syncLocalUser();
        await signOut();
        await new Promise(resolve => setTimeout(resolve, 2500));
        router.push('/');
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      statusRef.current?.pushMessage({ type: 'error', text: 'Failed to complete delete operation' });
    }
  }, [deleteType, router, syncLocalUser, user?.userId]);

  return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />

          <main className="flex-grow overflow-auto pt-8 p-4" style={{ minHeight: '79dvh' }}>
            <div className="max-w-2xl mx-auto space-y-6 text-white">
              <div className="space-y-4">

                <div className="form-group">
                  <label htmlFor="email" className="block mb-2">Email</label>
                  <InputWithButton
                    value={localUser.profile.email || emailToConnect}
                    onChange={(newEmail) => {
                      setEmailToConnect(newEmail);
                    }}
                    readOnly={!!localUser.profile.email && localUser.profile.email !== ''}
                    onButtonClick={handleSendMagicLink}
                    placeholder="you@example.com"
                    buttonLabel="Connect"
                    shouldShowButton={!isValidEmail(localUser.profile.email)}
                    disabled={!isValidEmail(emailToConnect)}
                  />
                </div>

                <div className="flex justify-between space-x-4">
                  <button
                    onClick={handleDeleteAllEntries}
                    className="w-full p-2 bg-orange-500 text-red rounded hover:bg-orange-600"
                  >
                    Delete All Journal Entries
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>

                <ConfirmationModal
                  isOpen={isModalOpen}
                  onClose={() => setModalOpen(false)}
                  onConfirm={handleDeleteConfirmed}
                  message={deleteType === 'entries'
                    ? "All journal entries will be permanently deleted."
                    : `Your account and journal entries will be permanently deleted.`}
                />

                <div className="flex items-center justify-between min-h-[20px]">
                  <StatusIndicator
                    ref={statusRef}
                  />
                </div>
              </div>
            </div>
          </main>
      </div>
  );
}
