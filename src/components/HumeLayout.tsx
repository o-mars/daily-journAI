"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import HumeMessages from "./HumeMessages";
import HumeControls from "./HumeControls";
import { useState, useEffect, useRef } from 'react';
import { HumeProvider } from "@/src/contexts/HumeContext";

export default function HumeLayout() {
  const { readyState, connect } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const hasAutoConnected = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldAutoConnect = searchParams.get("autoConnect") === "true";

    if (shouldAutoConnect && !hasAutoConnected.current && !isConnected) {
      hasAutoConnected.current = true;
      // Remove autoConnect from URL
      searchParams.delete("autoConnect");
      const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      window.history.replaceState({}, "", newUrl);

      connect();
    }
  }, [connect, isConnected]);

  if (isLoadingAction) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-64px)]">
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <HumeProvider>
      <main className="flex-grow overflow-auto px-2 relative" style={{ minHeight: 'calc(100dvh - 170px)' }}>
        {!isConnected ? (
          <div className="flex items-center justify-center h-full">
            <HumeControls setIsLoadingAction={setIsLoadingAction} />
          </div>
        ) : (
          <HumeMessages />
        )}
      </main>

      {isConnected && (
        <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
          <HumeControls setIsLoadingAction={setIsLoadingAction} />
        </footer>
      )}
    </HumeProvider>
  );
} 