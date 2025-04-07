"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import HumeVuMeter from "../VuMeter";
import { useEffect, useRef } from 'react';
import { HumeProvider, useHume } from "@/src/contexts/HumeContext";
import HumeEchoInput from "./HumeEchoInput";
import HumeSessionManager from "@/src/components/Hume/HumeSessionManager";

function HumeMinimalLayoutContent() {
  const { readyState, fft, isMuted } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const { isLoading, handleStartSession, handleEndSession } = useHume();
  const hasAttemptedStart = useRef(false);

  useEffect(() => {
    if (!hasAttemptedStart.current && readyState === VoiceReadyState.CLOSED) {
      hasAttemptedStart.current = true;
      handleStartSession();
    }
  }, [handleStartSession, readyState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-light"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-background">
      {isConnected && (
        <>
          <div className="flex-grow flex items-center justify-center w-full">
            <div className="bg-surface-1/30 rounded-xl p-12 w-[600px] h-[400px] flex flex-col items-center justify-center">
              <div className="relative mt-20">
                <div className="absolute inset-0 bg-accent-primary/20 blur-xl" />
                <div className="text-blue-500/70 text-lg mb-4 text-center">
                  Echo
                </div>
                <HumeVuMeter
                  fftData={fft || []}
                  height={120}
                  barCount={12}
                  barWidth={8}
                  barColor="rgb(59, 130, 246)"
                />
              </div>
            </div>
          </div>
          
          <footer className="bg-background sticky bottom-0 z-10 p-2">
            <div className="flex flex-col items-center gap-2">
              {isMuted && <HumeEchoInput />}
              <button
                onClick={() => handleEndSession(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-primary rounded-lg transition-colors text-lg font-medium"
              >
                End Session
              </button>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}

export default function HumeMinimalLayout() {
  return (
    <HumeProvider>
      <HumeSessionManager />
      <HumeMinimalLayoutContent />
    </HumeProvider>
  );
}
