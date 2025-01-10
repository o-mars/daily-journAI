"use client";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useVoice } from "@humeai/voice-react";
import { defaultJournalEntryMetadata, JournalConversationEntry } from '@/src/models/journal.entry';
import { transformHumeMessages } from '@/src/services/humeMessageTransformerService';
import { useUser } from '@/src/contexts/UserContext';
import { useHeader } from '@/src/contexts/HeaderContext';
import { saveJournalEntry, closePrivateJournalEntry } from '@/src/client/firebase.service.client';
import { ClientProvider } from '@/src/models/user.preferences';
import { trackEvent } from '@/src/services/metricsSerivce';

interface HumeContextType {
  allMessages: JournalConversationEntry[];
  isLoading: boolean;
  handleStartSession: () => Promise<void>;
  handleEndSession: (shouldSave: boolean) => Promise<void>;
}

const HumeContext = createContext<HumeContextType | undefined>(undefined);

export function HumeProvider({ children }: { children: React.ReactNode }) {
  const { messages: recentMessages, connect, disconnect, chatMetadata } = useVoice();
  const { user, syncLocalUser } = useUser();
  const { branding, navigateToView } = useHeader();
  const [allMessages, setAllMessages] = useState<JournalConversationEntry[]>([]);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const preventSleep = useCallback(() => {
    if (keepAliveRef.current) return;

    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    audio.loop = true;
    audio.play().catch(console.error);
    keepAliveRef.current = audio;
  }, []);

  const allowSleep = useCallback(() => {
    if (keepAliveRef.current) {
      keepAliveRef.current.pause();
      keepAliveRef.current = null;
    }
  }, []);

  const handleStartSession = useCallback(async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsLoading(true);
    try {
      await connect();
      trackEvent("session", "session-started", { userId: user?.userId, email: user?.profile?.email ?? '' });
      if (isMobile) {
        preventSleep();
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Error connecting to Hume, reloading and retrying...';
      trackEvent("session", "session-error", { error, userId: user?.userId, email: user?.profile?.email ?? '' });
      console.error(`Error starting session: ${error}`);
      navigateToView('start', { autoConnect: 'true' });
    } finally {
      setIsLoading(false);
    }
  }, [connect, preventSleep, navigateToView, user?.userId, user?.profile?.email]);

  const handleEndSession = useCallback(async (shouldSave: boolean) => {
    setIsLoading(true);
    allowSleep();
    disconnect();
    const didUserInteract = allMessages.some(message => message.from === 'user');
    if (didUserInteract) {
      try {
        const messagesToSave = [...allMessages];
        const durationInSeconds = allMessages.length > 0 ?
          Math.floor((new Date().getTime() - allMessages[0].sentAt.getTime()) / 1000) :
          0;
        const assistantEntries = allMessages.filter(message => message.from === 'assistant');
        const userEntries = allMessages.filter(message => message.from === 'user');

        const finalMetadata = {
          ...defaultJournalEntryMetadata,
          userId: user!.userId,
          email: user!.profile?.email ?? '',
          assistantEntries: assistantEntries.length,
          userEntries: userEntries.length,
          duration: durationInSeconds,
          type: branding.botType,
          inputLength: userEntries.reduce((acc, message) => acc + message.text.length, 0),
          outputLength: assistantEntries.reduce((acc, message) => acc + message.text.length, 0),
          provider: 'hume' as ClientProvider,
          ...(chatMetadata?.chatId && { chatId: chatMetadata.chatId }),
          ...(chatMetadata?.chatGroupId && { chatGroupId: chatMetadata.chatGroupId })
        };

        if (shouldSave) {
          const response = await saveJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-saved", { ...finalMetadata, journalId: response.id });
          await syncLocalUser();
          navigateToView('journals/:journalEntryId', { journalEntryId: response.id });
        } else {
          await closePrivateJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-discarded", { ...finalMetadata });
        }
        trackEvent("session", "session-ended", { ...finalMetadata });
      } catch (e) {
        trackEvent("session", "session-error", { error: e instanceof Error ? e.message : 'Error saving journal entry', userId: user?.userId, email: user?.profile?.email ?? '' });
        console.error(`Error saving journal entry: ${e}`);
      }
    }
    setIsLoading(false);
    setAllMessages([]);
  }, [allMessages, branding.botType, chatMetadata, disconnect, navigateToView, allowSleep, syncLocalUser, user]);

  useEffect(() => {
    if (recentMessages.length === 0) return;

    const transformedRecent = transformHumeMessages(recentMessages);
    if (transformedRecent.length === 0) return;

    setAllMessages(prevMessages => {
      if (prevMessages.length === 0) return transformedRecent;

      const oldestRecentMessage = transformedRecent[0];

      const overlapIndex = prevMessages.findIndex(
        msg => msg.from === oldestRecentMessage.from && 
              msg.text === oldestRecentMessage.text
      );

      if (overlapIndex === -1) {
        return [...prevMessages, ...transformedRecent];
      }

      return [
        ...prevMessages.slice(0, overlapIndex),
        ...transformedRecent
      ];
    });
  }, [recentMessages]);

  return (
    <HumeContext.Provider value={{ allMessages, isLoading, handleStartSession, handleEndSession }}>
      {children}
    </HumeContext.Provider>
  );
}

export function useHume() {
  const context = useContext(HumeContext);
  if (context === undefined) {
    throw new Error('useHumeMessages must be used within a HumeMessagesProvider');
  }
  return context;
}
