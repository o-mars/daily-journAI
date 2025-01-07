"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import HumeVuMeter from "../VuMeter";
import HumeControls from "./HumeControls";
import { useEffect, useRef, useCallback } from 'react';
import { HumeProvider, useHume } from "@/src/contexts/HumeContext";
import HumeEchoInput from "./HumeEchoInput";

function HumeMinimalLayoutContent() {
  const { readyState, fft, isMuted } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const hasAutoConnected = useRef(false);
  const { isLoading, handleStartSession, handleEndSession } = useHume();

  const startSession = useCallback(async () => {
    await handleStartSession();
  }, [handleStartSession]);

  const endSession = async () => {
    await handleEndSession(true);
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldAutoConnect = searchParams.get("autoConnect") === "true";

    if (shouldAutoConnect && !hasAutoConnected.current && !isConnected) {
      hasAutoConnected.current = true;
      searchParams.delete("autoConnect");
      const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      window.history.replaceState({}, "", newUrl);
      startSession();
    }
  }, [startSession, isConnected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-900">
      {!isConnected ? (
        <div className="flex items-center justify-center h-full">
          <HumeControls />
        </div>
      ) : (
        <>
          <div className="flex-grow flex items-center justify-center w-full">
            <div className="bg-gray-800/30 rounded-xl p-12 w-[600px] h-[400px] flex flex-col items-center justify-center">
              <div className="relative mt-20">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
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
          
          <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
            <div className="flex flex-col items-center gap-2">
              {isMuted && <HumeEchoInput />}
              <button
                onClick={endSession}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-lg font-medium"
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
      <HumeMinimalLayoutContent />
    </HumeProvider>
  );
}
