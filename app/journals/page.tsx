"use client";

import Header from "@/src/components/Header";
import { JournalEntryList } from "@/src/components/JournalEntryList";
import { useRouter } from 'next/navigation';
import { JournalEntry } from "@/src/models/journal.entry";
import { useUser } from "@/src/contexts/UserContext";

export default function Journals() {
  const { journalEntries } = useUser();
  const router = useRouter();

  const handleEntrySelect = (entry: JournalEntry) => {
    router.push(`/journals/${entry.id}`);
  };

  return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />

        <main className="relative" style={{ minHeight: 'calc(100svh - 170px)' }}>
          <JournalEntryList entries={journalEntries} onEntrySelect={handleEntrySelect} />
        </main>
      </div>
  );
}