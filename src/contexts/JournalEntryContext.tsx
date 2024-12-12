"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
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
  const [messages, setMessages] = useState<JournalConversationEntry[]>([]);
  const botTextStream = useRef<string[]>([]);
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [lastSavedJournalId, setLastSavedJournalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useRTVIClientEvent(RTVIEvent.UserTranscript, (data: TranscriptData) => {
    if (!data.final) return;
    setMessages((prevMessages) => {
      const wasPreviousSender = prevMessages.length > 0 && prevMessages[prevMessages.length - 1].from === 'user';
      if (!wasPreviousSender) return [...prevMessages, { from: 'user', text: data.text, sentAt: new Date(data.timestamp) }];
      
      const untouchedMessages = prevMessages.filter((_, index) => index !== prevMessages.length - 1);
      untouchedMessages.push({ from: 'user', sentAt: new Date(data.timestamp), text: `${prevMessages[prevMessages.length - 1].text} ${data.text}` });
      return untouchedMessages;
    });
  });

  useRTVIClientEvent(RTVIEvent.BotLlmText, ({ text }: BotLLMTextData) => {
    botTextStream.current.push(text);
  });

  useRTVIClientEvent(RTVIEvent.BotLlmStopped, () => {
    const text = botTextStream.current.join('');
    botTextStream.current = [];
    if (text === '') return;

    setMessages((prevMessages) => [...prevMessages, { from: 'assistant', sentAt: new Date(), text }]);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, async () => {
    const didUserInteract = messages.some(message => message.from === 'user');
    if (didUserInteract) {
      setIsLoading(true);
      try {
        const messagesToSave = [...messages];
        const durationInSeconds = messages.length > 0 ? 
          Math.floor((new Date().getTime() - messages[0].sentAt.getTime()) / 1000) : 
          0;
        const assistantEntries = messages.filter(message => message.from === 'assistant');
        const userEntries = messages.filter(message => message.from === 'user');

        const finalMetadata: JournalEntryMetadata = {
          ...defaultJournalEntryMetadata,
          userId: user!.userId,
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
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  });

  const addMessage = (message: JournalConversationEntry) => {
    setMessages((prevMessages) => [...prevMessages, message]);
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
