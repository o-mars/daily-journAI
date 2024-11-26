"use client";

import VoiceControls from "../../src/components/VoiceControls";
import Conversation from "@/src/components/Conversation";
import Header from "@/src/components/Header";

export default function Dashboard() {

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
