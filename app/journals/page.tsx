"use client";

import VoiceControls from "../../src/components/VoiceControls";
import { MessageProvider } from "@/src/contexts/MessageContext";
import Header from "@/src/components/Header";
import { JournalEntryList } from "@/src/components/JournalEntryList";
import { useUser } from "@/src/contexts/UserContext";
import { useRouter } from 'next/navigation';
import { JournalEntry } from "@/src/models/journal.entry";

export default function Journals() {
  const { journalEntries } = useUser();
  const router = useRouter();
  
  const handleEntrySelect = (entry: JournalEntry) => {
    router.push(`/journals/${entry.id}`);
  };

  return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />

        <MessageProvider>
          <main className="flex-grow overflow-auto p-2">
            <JournalEntryList entries={journalEntries} onEntrySelect={handleEntrySelect} />
          </main>

          <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
            <VoiceControls />
          </footer>
        </MessageProvider>
      </div>
  );
}