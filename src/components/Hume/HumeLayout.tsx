"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import HumeMessages from "./HumeMessages";
import HumeControls from "./HumeControls";
import { useEffect, useRef } from 'react';
import { HumeProvider, useHume } from "@/src/contexts/HumeContext";
import HumeSessionManager from "./HumeSessionManager";

function HumeLayoutContent() {
  const { readyState } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const { handleStartSession, isLoading } = useHume();
  const hasAttemptedStart = useRef(false);

  useEffect(() => {
    if (!hasAttemptedStart.current && (readyState === VoiceReadyState.IDLE || readyState === VoiceReadyState.CLOSED)) {
      hasAttemptedStart.current = true;
      handleStartSession();
    }
  }, [handleStartSession, readyState]);

  useEffect(() => {
    if (readyState === VoiceReadyState.CLOSED) {
      hasAttemptedStart.current = false;
    }
  }, [readyState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1" style={{ height: 'calc(100svh - 64px)' }}>
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100svh-64px)]">
      <main className="flex-1 px-2 relative overflow-y-auto">
        {isConnected && <HumeMessages />}
      </main>

      {isConnected && (
        <footer className="bg-gray-900 w-full z-10 p-2">
          <HumeControls />
        </footer>
      )}
    </div>
  );
}

export default function HumeLayout() {
  return (
    <HumeProvider>
      <HumeSessionManager />
      <HumeLayoutContent />
    </HumeProvider>
  );
}
