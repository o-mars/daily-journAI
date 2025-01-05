"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import HumeVuMeter from "./HumeVuMeter";
import HumeControls from "./HumeControls";
import { useState, useEffect, useRef } from 'react';
import { HumeMessagesProvider, useHumeMessages } from "@/src/contexts/HumeMessagesContext";

// New inner component that has access to the context
function HumeMinimalLayoutContent() {
  const { readyState, connect, fft } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const hasAutoConnected = useRef(false);
  const { handleEndSession } = useHumeMessages();

  const endSession = async () => {
    setIsLoadingAction(true);
    await handleEndSession(true);
    setIsLoadingAction(false);
  }

  useEffect(() => {
    // Same auto-connect logic as HumeLayout
    const searchParams = new URLSearchParams(window.location.search);
    const shouldAutoConnect = searchParams.get("autoConnect") === "true";

    if (shouldAutoConnect && !hasAutoConnected.current && !isConnected) {
      hasAutoConnected.current = true;
      searchParams.delete("autoConnect");
      const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      window.history.replaceState({}, "", newUrl);
      connect();
    }
  }, [connect, isConnected]);

  if (isLoadingAction) {
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
          <HumeControls setIsLoadingAction={setIsLoadingAction} />
        </div>
      ) : (
        <>
          <div className="flex-grow flex items-center justify-center w-full">
            <div className="bg-gray-800/30 rounded-xl p-12 w-[600px] h-[400px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
                <div className="text-blue-500/70 text-sm mb-2 text-center">Echo</div>
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
            <div className="flex justify-center">
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

// Main component that provides the context
export default function HumeMinimalLayout() {
  return (
    <HumeMessagesProvider>
      <HumeMinimalLayoutContent />
    </HumeMessagesProvider>
  );
} 