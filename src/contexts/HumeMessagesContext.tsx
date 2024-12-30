"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { useVoice } from "@humeai/voice-react";
import { JournalConversationEntry } from '@/src/models/journal.entry';
import { transformHumeMessages } from '@/src/services/humeMessageTransformerService';

interface HumeMessagesContextType {
  allMessages: JournalConversationEntry[];
}

const HumeMessagesContext = createContext<HumeMessagesContextType | undefined>(undefined);

export function HumeMessagesProvider({ children }: { children: React.ReactNode }) {
  const { messages: recentMessages } = useVoice();
  const [allMessages, setAllMessages] = useState<JournalConversationEntry[]>([]);

  useEffect(() => {
    if (recentMessages.length === 0) return;

    const transformedRecent = transformHumeMessages(recentMessages);

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
    <HumeMessagesContext.Provider value={{ allMessages }}>
      {children}
    </HumeMessagesContext.Provider>
  );
}

export function useHumeMessages() {
  const context = useContext(HumeMessagesContext);
  if (context === undefined) {
    throw new Error('useHumeMessages must be used within a HumeMessagesProvider');
  }
  return context;
} 