"use client";

import Feedback from "@/src/components/Feedback";
import Header from "@/src/components/Header";
import VoiceControls from "@/src/components/VoiceControls";
import { useSearchParams } from "next/navigation";

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get('entryId') || '';

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      <div className="flex items-start justify-center min-h-screen bg-gray-900 pt-8 p-4">
        <div className="w-full max-w-2xl min-h-[400px] bg-gray-950 rounded-lg shadow-xl p-6 m-4">
          <Feedback lastJournalEntryId={entryId} />
        </div>
      </div>

      <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
        <VoiceControls />
      </footer>
    </div>
  );
} 