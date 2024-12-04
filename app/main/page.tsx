"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VoiceControls from "../../src/components/VoiceControls";
import Conversation from "@/src/components/Conversation";
import Header from "@/src/components/Header";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const autoConnect = useMemo(() => searchParams.get("autoConnect") === "true", [searchParams]);
  const hasAutoConnected = useRef(false);
  const { isStarted, isLoading, connect } = useVoiceClient()!;

  useEffect(() => {
    if (autoConnect && !hasAutoConnected.current) {
      hasAutoConnected.current = true;
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete('autoConnect');
      const newUrl = `/main?${searchParams.toString()}`;
      window.history.replaceState({}, '', newUrl);

      if (!isStarted && !isLoading) connect();
    }
  }, [autoConnect, connect, isStarted, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <main className="flex-grow overflow-auto p-2">
        <Conversation />
      </main>

      <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
        <VoiceControls />
      </footer>
    </div>
  );
}
