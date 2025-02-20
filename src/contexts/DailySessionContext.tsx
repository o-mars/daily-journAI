"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useMemo } from "react";
import { useRTVIClientEvent } from "realtime-ai-react";
import { defaultJournalEntryMetadata, JournalConversationEntry } from "@/src/models/journal.entry";
import { BotLLMTextData, RTVIEvent, TranscriptData } from "realtime-ai";
import { closePrivateJournalEntry, saveJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";
import { useHeader } from "@/src/contexts/HeaderContext";
import { useDailyClient } from "@/src/contexts/DailyClientContext";
import { trackEvent } from "@/src/services/metricsSerivce";
import { ClientProvider } from "@/src/models/user.preferences";

interface DailySessionContextType {
  messages: JournalConversationEntry[];
  addMessage: (message: JournalConversationEntry) => void;
  isTextInputVisible: boolean;
  toggleTextInputVisibility: () => void;
  lastSavedJournalId: string | null;
  isLoading: boolean;
}

const DailySessionContext = createContext<DailySessionContextType | undefined>(undefined);

export const DailySessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { branding, navigateToView } = useHeader();
  const { syncLocalUser, user } = useUser();
  const { shouldSaveRef, isStarted } = useDailyClient()!;
  const [rawMessages, setRawMessages] = useState<JournalConversationEntry[]>([]);
  const messages = useMemo(() => {
    return rawMessages.reduce((acc, message) => {
      const lastMessage = acc[acc.length - 1];

      if (lastMessage && lastMessage.from === message.from) {
        lastMessage.text = `${lastMessage.text} ${message.text}`;
        lastMessage.sentAt = message.sentAt; // Update timestamp to latest
        return acc;
      } else {
        return [...acc, { ...message }];
      }
    }, [] as JournalConversationEntry[]);
  }, [rawMessages]);
  const botTextStream = useRef<string[]>([]);
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [lastSavedJournalId, setLastSavedJournalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useRTVIClientEvent(RTVIEvent.UserTranscript, (data: TranscriptData) => {
    setRawMessages((prevMessages) => {
      const previousMessage = prevMessages[prevMessages.length - 1];
      const wasPreviousSender = prevMessages.length > 0 && previousMessage?.from === 'user';

      if (wasPreviousSender && previousMessage.isPartial) {
        const untouchedMessages = prevMessages.filter((_, index) => index !== prevMessages.length - 1);
        return [...untouchedMessages, {
          from: 'user',
          text: data.text,
          sentAt: new Date(data.timestamp),
          isPartial: !data.final
        }];
      }

      return [...prevMessages, {
        from: 'user',
        text: data.text,
        sentAt: new Date(data.timestamp),
        isPartial: !data.final
      }];
    });
  });

  useRTVIClientEvent(RTVIEvent.BotLlmText, ({ text }: BotLLMTextData) => {
    botTextStream.current.push(text);
  });

  useRTVIClientEvent(RTVIEvent.BotLlmStopped, () => {
    const text = botTextStream.current.join('');
    botTextStream.current = [];
    if (text === '') return;

    setRawMessages((prevMessages) => [...prevMessages, { from: 'assistant', sentAt: new Date(), text }]);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, async () => {
    if (!isStarted) return;

    const didUserInteract = rawMessages.some(message => message.from === 'user');
    if (didUserInteract) {
      setIsLoading(true);
      try {
        const messagesToSave = [...messages];
        const durationInSeconds = rawMessages.length > 0 ?
          Math.floor((new Date().getTime() - rawMessages[0].sentAt.getTime()) / 1000) :
          0;
        const assistantEntries = rawMessages.filter(message => message.from === 'assistant');
        const userEntries = rawMessages.filter(message => message.from === 'user');

        const finalMetadata = {
          ...defaultJournalEntryMetadata,
          userId: user!.userId,
          email: user!.profile?.email ?? '',
          assistantEntries: assistantEntries.length,
          userEntries: userEntries.length,
          duration: durationInSeconds,
          type: branding.botType,
          category: user!.preferences.selectedConfig,
          provider: 'dailybots' as ClientProvider,
          inputLength: userEntries.reduce((acc, message) => acc + message.text.length, 0),
          outputLength: assistantEntries.reduce((acc, message) => acc + message.text.length, 0),
        };

        if (shouldSaveRef.current) {
          const response = await saveJournalEntry(user!.preferences.selectedConfig, messagesToSave, finalMetadata);
          trackEvent("session", "session-saved", { ...finalMetadata, journalId: response.id });
          await syncLocalUser();
          setLastSavedJournalId(response.id);
          navigateToView('journals/:journalEntryId', { journalEntryId: response.id });
        } else {
          await closePrivateJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-discarded", { ...finalMetadata });
          navigateToView('main');
        }
        trackEvent("session", "session-ended", { ...finalMetadata });
      } finally {
        setIsLoading(false);
        setRawMessages([]);
      }
    } else {
      setRawMessages([]);
      navigateToView('main');
    }
  });

  const addMessage = (message: JournalConversationEntry) => {
    setRawMessages((prevMessages) => [...prevMessages, message]);
  };

  const toggleTextInputVisibility = () => {
    setIsTextInputVisible((prev) => !prev);
  };

  return (
    <DailySessionContext.Provider value={{
      messages,
      addMessage,
      isTextInputVisible,
      toggleTextInputVisibility,
      lastSavedJournalId,
      isLoading
    }}>
      {/* <DailyNarrationProvider> */}
        {children}
      {/* </DailyNarrationProvider> */}
    </DailySessionContext.Provider>
  );
};

export const useDailySessionContext = () => {
  const context = useContext(DailySessionContext);
  if (!context) {
    throw new Error("useDailySessionContext must be used within a DailySessionProvider");
  }
  return context;
};