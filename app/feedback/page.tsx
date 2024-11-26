"use client";

import Feedback from "@/src/components/Feedback";
import Header from "@/src/components/Header";
import VoiceControls from "@/src/components/VoiceControls";
import { useHeader } from "@/src/contexts/HeaderContext";

export default function FeedbackPage() {
  const { lastJournalEntryId } = useHeader();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <div className="flex items-start justify-center min-h-screen bg-gray-900 pt-24 p-4">
        <div className="w-full max-w-sm min-h-[350px] bg-gray-950 rounded-lg shadow-xl p-6 m-4">
          <Feedback lastJournalEntryId={lastJournalEntryId} />
        </div>
      </div>

      <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
        <VoiceControls />
      </footer>
    </div>
  );
} 