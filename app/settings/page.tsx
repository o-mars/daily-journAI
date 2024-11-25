"use client";

import { useEffect, useState } from "react";

import VoiceControls from "../../src/components/VoiceControls";

import { useUser } from "@/src/contexts/UserContext";
import { MessageProvider } from "@/src/contexts/MessageContext";
import Header from "@/src/components/Header";

export default function Settings() {
  const { user } = useUser();

  const [lastJournalEntryId, setLastJournalEntryId] = useState<string>('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.journalEntries.length === 0) return;
    const latestEntry = user.journalEntries[0];
    if (latestEntry.id === lastJournalEntryId || !latestEntry.endTime) return;
    const entryAge = new Date().getTime() - new Date(latestEntry.endTime).getTime();
    if (entryAge > 1000 * 60 * 60) return; // Older than 1 hour
    setLastJournalEntryId(latestEntry.id);
    if (entryAge < 1000 * 60 * 2) setIsFeedbackOpen(true); // Less than 2 minutes old
  }, [user, lastJournalEntryId]);

  const handleFeedback = () => {
    setIsFeedbackOpen(prev => !prev);
  };

  return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header
          onFeedbackClick={handleFeedback}
          isFeedbackOpen={isFeedbackOpen}
          onCloseFeedback={() => setIsFeedbackOpen(false)}
          lastJournalEntryId={lastJournalEntryId}
        />

        <MessageProvider>
          <main className="flex-grow overflow-auto p-2">
            <div>
              <h1>Settings</h1>
              <p>
                Here you can view your settings.
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
