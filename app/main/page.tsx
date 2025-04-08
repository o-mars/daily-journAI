"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/src/components/Header";
import Modal from "@/src/components/Modal";
import { useUser } from "@/src/contexts/UserContext";
import { auth } from "@/firebase.config";
import EmailAuth from "@/src/components/EmailAuth";
import { useDailySessionContext } from "@/src/contexts/DailySessionContext";
import { useDailyClient } from "@/src/contexts/DailyClientContext";
import DailyVoiceControls from "@/src/components/Daily/DailyVoiceControls";
import DailyConversation from "@/src/components/Daily/DailyConversation";
import DailySelector from "@/src/components/Daily/DailySelector";
import { useHeader } from "@/src/contexts/HeaderContext";

function Dashboard() {
  const { user, isInitialized } = useUser();
  const { lastSavedJournalId, isLoading: isSessionLoading } = useDailySessionContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();
  const [shouldAutoConnect] = useState(() => searchParams.get("autoConnect") === "true");
  const hasAutoConnected = useRef(false);
  const { isStarted, isLoading: isClientLoading, connect } = useDailyClient()!;
  const [isConnecting, setIsConnecting] = useState(false);
  const { navigateToView} = useHeader()

  const isLoading = isClientLoading || isSessionLoading || isConnecting || (shouldAutoConnect && !hasAutoConnected.current);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      navigateToView('welcome');
      return;
    }
  }, [user, isInitialized, navigateToView]);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

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
        navigateToView('journals/:journalEntryId', { journalEntryId: lastSavedJournalId });
      }
    }
  }, [lastSavedJournalId, user?.profile.isAnonymous]);

  if (isLoading || (isConnecting && !isStarted)) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
        <footer className="bg-background sticky bottom-0 z-10 p-2">
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
