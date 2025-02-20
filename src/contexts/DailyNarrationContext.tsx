"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/src/contexts/UserContext';
import { useDailyClient } from '@/src/contexts/DailyClientContext';
import { ConfigCategory } from '@/src/models/categories.config';
import { getFirstMessageForCategory } from '@/src/models/configs/daily/daily.config';
import { useDailySessionContext } from '@/src/contexts/DailySessionContext';

interface QueuedNarration {
  text: string;
  sent: boolean;
  confirmed: boolean;
}

interface DailyNarrationContextType {
  isNarrating: boolean;
}

const DailyNarrationContext = createContext<DailyNarrationContextType | undefined>(undefined);

export const DailyNarrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { isStarted, voiceClient, isMicEnabled, toggleMicEnabled } = useDailyClient()!;
  const { addMessage } = useDailySessionContext();
  const [messageQueue, setMessageQueue] = useState<QueuedNarration[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const isProcessingRef = useRef(false);
  const hasSetMessageQueueRef = useRef(false);

  const configCategory: ConfigCategory = user?.preferences.selectedConfig ?? 'journaling';

  useEffect(() => {
    if (!isStarted) {
      isProcessingRef.current = false;
      setMessageQueue([]);
      hasSetMessageQueueRef.current = false;
      return;
    }

    if (!hasSetMessageQueueRef.current) {
      const prompts = getFirstMessageForCategory(configCategory, user?.isNewUser ?? true);

      setMessageQueue(prompts.map((text: string) => ({
        text,
        sent: false,
        confirmed: false
      })));
      hasSetMessageQueueRef.current = true;

      if (prompts.length > 0) {
        setIsNarrating(true);
        if (isMicEnabled) {
          toggleMicEnabled();
        }
      }
    }
  }, [isStarted, voiceClient, isMicEnabled, toggleMicEnabled, configCategory, user]);

  useEffect(() => {
    if (!isStarted || messageQueue.length === 0) return;

    const processNextMessage = async () => {
      const nextUnconfirmedMessageIndex = messageQueue.findIndex(msg => !msg.confirmed);
      if (nextUnconfirmedMessageIndex === -1) {
        if (!isMicEnabled) {
          toggleMicEnabled();
        }
        setMessageQueue([]);
        setIsNarrating(false);
        return;
      }

      const currentMessage = messageQueue[nextUnconfirmedMessageIndex];
      if (!currentMessage.sent && !isProcessingRef.current) {
        isProcessingRef.current = true;
        
        await voiceClient?.action({
          service: "tts",
          action: "say",
          arguments: [{ name: "text", value: currentMessage.text }],
        });
        addMessage({ from: 'assistant', text: currentMessage.text, sentAt: new Date() });

        setMessageQueue(prev => prev.map((msg, i) => 
          i === nextUnconfirmedMessageIndex ? { ...msg, sent: true, confirmed: true } : msg
        ));
        isProcessingRef.current = false;
      }
    };

    processNextMessage();
  }, [isStarted, messageQueue, isMicEnabled, toggleMicEnabled, addMessage, voiceClient]);

  return (
    <DailyNarrationContext.Provider value={{ isNarrating }}>
      {children}
    </DailyNarrationContext.Provider>
  );
};

export const useDailyNarration = () => {
  const context = useContext(DailyNarrationContext);
  if (!context) {
    throw new Error('useDailyNarration must be used within a DailyNarrationProvider');
  }
  return context;
}; 