"use client";
import { useEffect, useRef } from 'react';
import { useVoice, VoiceReadyState } from '@humeai/voice-react';
import { useUser } from '@/src/contexts/UserContext';
import { DATING_HUME_FIRST_PROMPT } from "@/src/models/hume/configs/dating";

export default function HumeSessionManager() {
  const { readyState, sendAssistantInput, messages } = useVoice();
  const { user } = useUser();
  const hasSentFirstMessage = useRef(false);
  const isConnected = readyState === VoiceReadyState.OPEN;
  const isDatingConfig = user?.preferences.selectedConfig === 'dating';

  useEffect(() => {
    if (!isConnected) {
      hasSentFirstMessage.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    if (
      isDatingConfig &&
      isConnected &&
      !hasSentFirstMessage.current &&
      messages.filter(msg => msg.type === 'assistant_end').length > 0
    ) {
      hasSentFirstMessage.current = true;
      sendAssistantInput(DATING_HUME_FIRST_PROMPT);
    }
  }, [isConnected, sendAssistantInput, messages, isDatingConfig]);

  return null;
}