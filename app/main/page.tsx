"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/src/components/Header";
import Modal from "@/src/components/Modal";
import { useUser } from "@/src/contexts/UserContext";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase.config";
import EmailAuth from "@/src/components/EmailAuth";
import { useDailySessionContext } from "@/src/contexts/DailySessionContext";
import { useDailyClient } from "@/src/contexts/DailyClientContext";
import DailyVoiceControls from "@/src/components/Daily/DailyVoiceControls";
import DailyConversation from "@/src/components/Daily/DailyConversation";
import DailySelector from "@/src/components/Daily/DailySelector";

function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { lastSavedJournalId, isLoading: isSessionLoading } = useDailySessionContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);
  const hasAutoConnected = useRef(false);
  const { isInitialized } = useUser();
  const { isStarted, isLoading: isClientLoading, connect } = useDailyClient()!;
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  useEffect(() => {
    const autoConnect = searchParams.get("autoConnect") === "true";
    setShouldAutoConnect(autoConnect);
  }, [searchParams]);

  useEffect(() => {
    if (shouldAutoConnect && !hasAutoConnected.current && isInitialized) {
      hasAutoConnected.current = true;
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("autoConnect");
      const newUrl = `/main?${searchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);

      if (!isStarted && !isClientLoading) {
        console.debug('auto connecting to voice client and resetting window search params');
        handleConnect();
      }
    }
  }, [shouldAutoConnect, isStarted, isClientLoading, isInitialized, handleConnect]);

  useEffect(() => {
    if (lastSavedJournalId) {
      if (user?.profile.isAnonymous) {
        setShowAuthModal(true);
      } else {
        router.push(`/journals/${lastSavedJournalId}`);
      }
    }
  }, [lastSavedJournalId, user?.profile.isAnonymous, router]);

  const isLoading = isClientLoading || isSessionLoading || isConnecting;

  if (isLoading || (isConnecting && !isStarted)) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <main className="flex-grow">
        {!isStarted ? (
          <DailySelector onStart={handleConnect} />
        ) : (
          <div className="p-2 h-full overflow-auto">
            <DailyConversation />
          </div>
        )}
      </main>

      {isStarted && (
        <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
          <DailyVoiceControls />
        </footer>
      )}

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Save Journal Entry"
      >
        <EmailAuth
          firebaseUser={auth?.currentUser}
          journalEntryId={lastSavedJournalId || ''}
        />
      </Modal>
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
