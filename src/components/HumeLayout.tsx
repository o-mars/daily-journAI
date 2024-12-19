"use client";

import { useVoice, VoiceReadyState } from "@humeai/voice-react"; // Or whatever the hook is called in Hume's API
import HumeMessages from "./HumeMessages";
import HumeControls from "./HumeControls";

export default function HumeLayout() {
  const { readyState } = useVoice();
  const isConnected = readyState === VoiceReadyState.OPEN;

  return (
    <>
      <main className="flex-grow overflow-auto p-2 relative min-h-[80vh]">
        {!isConnected ? (
          <div className="flex items-center justify-center h-full">
            <HumeControls />
          </div>
        ) : (
          <HumeMessages />
        )}
      </main>

      {isConnected && (
        <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
          <HumeControls />
        </footer>
      )}
    </>
  );
} 