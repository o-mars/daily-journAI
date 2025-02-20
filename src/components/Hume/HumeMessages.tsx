// ./components/Messages.tsx
"use client";
import { useHume } from '@/src/contexts/HumeContext';
import { useVoice } from '@humeai/voice-react';
import Conversation from '../Conversation';

export default function HumeMessages() {
  const { isMuted } = useVoice();
  const { allMessages } = useHume();

  return (
    <Conversation
      messages={allMessages}
      isTextInputVisible={isMuted}
      staticHeight={false}
    />
  );
}
