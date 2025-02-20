"use client";
import { useEffect, useRef, useState } from 'react';
import { useVoice, VoiceReadyState } from '@humeai/voice-react';
import { useUser } from '@/src/contexts/UserContext';
import { CONFIG_TEMPLATES } from '@/src/models/configs/hume/hume.config';
import { ConfigCategory } from '@/src/models/categories.config';

interface QueuedMessage {
  text: string;
  sent: boolean;
  confirmed: boolean;
}

export default function HumeSessionManager() {
  const { readyState, sendAssistantInput, messages, mute, unmute } = useVoice();
  const { user } = useUser();
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  const isProcessingRef = useRef(false);
  const hasSetMessageQueueRef = useRef(false);
  const isConnected = readyState === VoiceReadyState.OPEN;
  const configCategory: ConfigCategory = user?.preferences.selectedConfig ?? 'journaling';
  const isJournalingConfig = configCategory === 'journaling';

  useEffect(() => {
    if (!isConnected) {
      isProcessingRef.current = false;
      setMessageQueue([]);
      hasSetMessageQueueRef.current = false;
      return;
    }

    if (!isJournalingConfig && !hasSetMessageQueueRef.current) {
      const prompts = CONFIG_TEMPLATES[configCategory].firstTimePrompts;

      setMessageQueue(prompts.map((text: string) => ({
        text,
        sent: false,
        confirmed: false
      })));
      hasSetMessageQueueRef.current = true;

      if (prompts.length > 0) mute();
    }
  }, [isConnected, configCategory, isJournalingConfig, user, mute]);

  useEffect(() => {
    if (!isConnected || messageQueue.length === 0) return;

    const processNextMessage = () => {
      const nextUnconfirmedMessageIndex = messageQueue.findIndex(msg => !msg.confirmed);
      if (nextUnconfirmedMessageIndex === -1) {
        unmute();
        setMessageQueue([]);
        return;
      }

      const currentMessage = messageQueue[nextUnconfirmedMessageIndex];
      if (!currentMessage.sent && !isProcessingRef.current) {
        isProcessingRef.current = true;
        sendAssistantInput(currentMessage.text);
        setMessageQueue(prev => prev.map((msg, i) => 
          i === nextUnconfirmedMessageIndex ? { ...msg, sent: true } : msg
        ));
        return;
      }

      const messageIndexOfCurrentMessage = messages.findIndex(msg =>
        msg.type === 'assistant_message' && 
        msg.message.content?.includes(currentMessage.text)
      );
      if (messageIndexOfCurrentMessage !== -1) {
        const hasEndMarker = messages.slice(messageIndexOfCurrentMessage).some(msg => msg.type === 'assistant_end');

        if (hasEndMarker) {
          isProcessingRef.current = false;
          setMessageQueue(prev => prev.map((msg, i) => 
            i === nextUnconfirmedMessageIndex ? { ...msg, confirmed: true } : msg
          ));
        }
      }
    };

    processNextMessage();
  }, [isConnected, messageQueue, messages, sendAssistantInput, unmute]);

  return null;
}