"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useMemo } from "react";
import { useRTVIClientEvent } from "realtime-ai-react";
import { defaultJournalEntryMetadata, JournalConversationEntry, JournalEntryMetadata } from "@/src/models/journal.entry";
import { BotLLMTextData, RTVIEvent, TranscriptData } from "realtime-ai";
import { closePrivateJournalEntry, saveJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";
import { useHeader } from "@/src/contexts/HeaderContext";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import { trackEvent } from "@/src/services/metricsSerivce";

interface JournalEntryContextType {
  messages: JournalConversationEntry[];
  addMessage: (message: JournalConversationEntry) => void;
  isTextInputVisible: boolean;
  toggleTextInputVisibility: () => void;
  lastSavedJournalId: string | null;
  isLoading: boolean;
}

const JournalEntryContext = createContext<JournalEntryContextType | undefined>(undefined);

export const JournalEntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { branding } = useHeader();
  const { syncLocalUser, user } = useUser();
  const { shouldSaveRef } = useVoiceClient()!;
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
    const didUserInteract = rawMessages.some(message => message.from === 'user');
    if (didUserInteract) {
      setIsLoading(true);
      try {
        const messagesToSave = [...rawMessages];
        const durationInSeconds = rawMessages.length > 0 ? 
          Math.floor((new Date().getTime() - rawMessages[0].sentAt.getTime()) / 1000) : 
          0;
        const assistantEntries = rawMessages.filter(message => message.from === 'assistant');
        const userEntries = rawMessages.filter(message => message.from === 'user');

        const finalMetadata: JournalEntryMetadata = {
          ...defaultJournalEntryMetadata,
          userId: user!.userId,
          email: user!.profile?.email ?? '',
          assistantEntries: assistantEntries.length,
          userEntries: userEntries.length,
          duration: durationInSeconds,
          type: branding.botType,
          inputLength: userEntries.reduce((acc, message) => acc + message.text.length, 0),
          outputLength: assistantEntries.reduce((acc, message) => acc + message.text.length, 0),
        };

        if (shouldSaveRef.current) {
          const response = await saveJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-saved", { ...finalMetadata, journalId: response.id });
          await syncLocalUser();
          setLastSavedJournalId(response.id);
        } else {
          await closePrivateJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-discarded", { ...finalMetadata });
        }
        trackEvent("session", "session-ended", { ...finalMetadata });
      } finally {
        setIsLoading(false);
        setRawMessages([]);
      }
    } else {
      setRawMessages([]);
    }
  });

  const addMessage = (message: JournalConversationEntry) => {
    setRawMessages((prevMessages) => [...prevMessages, message]);
  };

  const toggleTextInputVisibility = () => {
    setIsTextInputVisible((prev) => !prev);
  };

  return (
    <JournalEntryContext.Provider value={{
      messages,
      addMessage,
      isTextInputVisible,
      toggleTextInputVisibility,
      lastSavedJournalId,
      isLoading
    }}>
      {children}
    </JournalEntryContext.Provider>
  );
};

export const useJournalEntryContext = () => {
  const context = useContext(JournalEntryContext);
  if (!context) {
    throw new Error("useJournalEntryContext must be used within a JournalEntryProvider");
  }
  return context;
};
