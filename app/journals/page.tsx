"use client";

import Header from "@/src/components/Header";
import { JournalEntryList } from "@/src/components/JournalEntryList";
import { useHeader } from "@/src/contexts/HeaderContext";
import { JournalEntry } from "@/src/models/journal.entry";
import { useUser } from "@/src/contexts/UserContext";
export default function Journals() {
  const { journalEntries } = useUser();
  const { navigateToView } = useHeader();

  const handleEntrySelect = (entry: JournalEntry) => {
    navigateToView('journals/:journalEntryId', { journalEntryId: entry.id });
  };

  return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />

        <main className="relative" style={{ minHeight: 'calc(100svh - 170px)' }}>
          <JournalEntryList entries={journalEntries} onEntrySelect={handleEntrySelect} />
        </main>
      </div>
  );
}