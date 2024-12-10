"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import VoiceControls from "../../src/components/VoiceControls";
import Conversation from "@/src/components/Conversation";
import Header from "@/src/components/Header";
import Modal from "@/src/components/Modal";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import { useUser } from "@/src/contexts/UserContext";
import { useJournalEntryContext } from "@/src/contexts/JournalEntryContext";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase.config";
import EmailAuth from "@/src/components/EmailAuth";

function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { lastSavedJournalId } = useJournalEntryContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);
  const hasAutoConnected = useRef(false);
  const { isInitialized } = useUser();
  const { isStarted, isLoading, connect } = useVoiceClient()!;

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

      if (!isStarted && !isLoading) {
        console.debug('auto connecting to voice client and resetting window search params');
        connect();
      }
    }
  }, [shouldAutoConnect, connect, isStarted, isLoading, isInitialized]);

  useEffect(() => {
    if (lastSavedJournalId) {
      if (user?.profile.isAnonymous) {
        setShowAuthModal(true);
      } else {
        router.push(`/journals/${lastSavedJournalId}`);
      }
    }
  }, [lastSavedJournalId, user?.profile.isAnonymous, router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <main className="flex-grow overflow-auto p-2">
        <Conversation />
      </main>

      <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
        <VoiceControls />
      </footer>

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Connect Your Phone"
      >
        <EmailAuth
          firebaseUser={auth?.currentUser}
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
