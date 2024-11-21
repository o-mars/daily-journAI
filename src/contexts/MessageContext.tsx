import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { useRTVIClientEvent } from "realtime-ai-react";
import { JournalConversationEntry } from "@/src/models/journal.entry";
import { BotLLMTextData, RTVIEvent, TranscriptData } from "realtime-ai";
import { saveJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";

interface MessageContextType {
  messages: JournalConversationEntry[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { fetchUser } = useUser();
  const [messages, setMessages] = useState<JournalConversationEntry[]>([]);
  const botTextStream = useRef<string[]>([]);

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
    setMessages((prevMessages) => [...prevMessages, { from: 'assistant', sentAt: new Date(), text }]);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, async () => {
    const didUserInteract = messages.some(message => message.from === 'user');
    if (didUserInteract) {
      const messagesToSave = [...messages];
      setMessages([]);
      await saveJournalEntry(messagesToSave);
      await fetchUser();
    } else {
      setMessages([]);
    }
  });

  return (
    <MessageContext.Provider value={{ messages }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
}; 