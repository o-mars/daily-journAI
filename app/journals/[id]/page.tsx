"use client";

import { JournalEntryView } from "@/src/components/JournalEntryView";
import Header from "@/src/components/Header";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { defaultJournalEntry, JournalEntry } from "@/src/models/journal.entry";
import { fetchJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";

export default function JournalEntryPage() {
  const params = useParams();
  const { isInitialized } = useUser();
  const [entry, setEntry] = useState<JournalEntry>(defaultJournalEntry);
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      if (!!entry && entry.conversation.length > 0) return;
      const fetchedEntry = await fetchJournalEntry(params.id as string);
      setEntry(fetchedEntry);
    };

    if (isInitialized) {
      fetchEntry();
    }
  }, [params.id, entry, isInitialized]);

  if (!entry) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow overflow-auto px-2">
        <JournalEntryView entry={entry} />
      </main>
    </div>
  );
} 