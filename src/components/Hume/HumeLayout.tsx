"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import HumeMessages from "./HumeMessages";
import HumeControls from "./HumeControls";
import { useEffect, useRef } from 'react';
import { HumeProvider, useHume } from "@/src/contexts/HumeContext";

function HumeLayoutContent() {
  const { readyState, isMuted } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const hasAutoConnected = useRef(false);
  const { handleStartSession, isLoading } = useHume();


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldAutoConnect = searchParams.get("autoConnect") === "true";

    if (shouldAutoConnect && !hasAutoConnected.current && !isConnected) {
      hasAutoConnected.current = true;
      searchParams.delete("autoConnect");
      const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      window.history.replaceState({}, "", newUrl);
      handleStartSession();
    }
  }, [handleStartSession, isConnected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100svh - 64px)'}}>
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <main
      className="flex-grow px-2 relative"
      style={{
        minHeight: `calc(100svh - ${170 + (isConnected && isMuted ? 60 : 0)}px)`
      }}
    >
      {!isConnected ? (
        <div className="flex items-center justify-center h-full">
          <HumeControls />
        </div>
      ) : (
        <HumeMessages />
      )}

      {isConnected && (
        <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
          <HumeControls />
        </footer>
      )}
    </main>
  );
}

export default function HumeLayout() {
  return (
    <HumeProvider>
      <HumeLayoutContent />
    </HumeProvider>
  );
}
