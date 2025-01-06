"use client";
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { defaultJournalEntryMetadata, JournalConversationEntry } from '@/src/models/journal.entry';
import { transformHumeMessages } from '@/src/services/humeMessageTransformerService';
import { useUser } from '@/src/contexts/UserContext';
import { useHeader } from '@/src/contexts/HeaderContext';
import { saveJournalEntry, closePrivateJournalEntry } from '@/src/client/firebase.service.client';
import { ClientProvider } from '@/src/models/user.preferences';
import { trackEvent } from '@/src/services/metricsSerivce';

interface HumeContextType {
  allMessages: JournalConversationEntry[];
  handleEndSession: (shouldSave: boolean) => Promise<void>;
}

const HumeContext = createContext<HumeContextType | undefined>(undefined);

export function HumeProvider({ children }: { children: React.ReactNode }) {
  const { messages: recentMessages, disconnect, chatMetadata, readyState, status } = useVoice();
  const { user, syncLocalUser } = useUser();
  const { branding, navigateToView } = useHeader();
  const [allMessages, setAllMessages] = useState<JournalConversationEntry[]>([]);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);

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

  const handleEndSession = useCallback(async (shouldSave: boolean) => {
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
        console.error(`Error saving journal entry: ${e}`);
      }
    }
  }, [allMessages, branding.botType, chatMetadata, disconnect, navigateToView, allowSleep, syncLocalUser, user]);

  useEffect(() => {
    const isSessionStarting = status.value === 'connected' && readyState === VoiceReadyState.OPEN;

    if (isSessionStarting) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        preventSleep();
      }
    }
    
    return () => {
      allowSleep();
    };
  }, [readyState, status, preventSleep, allowSleep]);

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
    <HumeContext.Provider value={{ allMessages, handleEndSession }}>
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