"use client";

import { JournalEntryView } from "@/src/components/JournalEntryView";
import Header from "@/src/components/Header";
import { useUser } from "@/src/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const { journalEntries } = useUser();
  const entry = journalEntries.find(entry => entry.id === params.id);
  const router = useRouter();

  if (!entry) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow overflow-auto p-2">
        <JournalEntryView entry={entry} onBack={() => router.back() } />
      </main>
    </div>
  );
} 