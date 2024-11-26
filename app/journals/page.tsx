"use client";

import VoiceControls from "../../src/components/VoiceControls";
import { MessageProvider } from "@/src/contexts/MessageContext";
import Header from "@/src/components/Header";

export default function Journals() {

  return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />

        <MessageProvider>
          <main className="flex-grow overflow-auto p-2">
            <div>
              <h1>Journals</h1>
              <p>
                Here you can view your past journals.
              </p>
            </div>
          </main>

          <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
            <VoiceControls />
          </footer>
        </MessageProvider>
      </div>
  );
}
