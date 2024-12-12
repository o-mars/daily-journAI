import React, { useState, useRef, useEffect } from "react";
import { LLMHelper } from "realtime-ai";
import Image from "next/image";
import { useJournalEntryContext } from "@/src/contexts/JournalEntryContext";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import InputWithButton from "./InputWithButton";
import { trackEvent } from "@/src/services/metricsSerivce";
import { useUser } from "@/src/contexts/UserContext";


const TextMessageInput: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addMessage } = useJournalEntryContext();
  const { voiceClient, resetIdleTimer } = useVoiceClient()!;
  const { user } = useUser();

  useEffect(() => {
    if (voiceClient?.connected) {
      inputRef.current?.focus();
    }
  }, [voiceClient?.connected]);

  const handleInputChange = (value: string) => {
    setInputText(value);
    resetIdleTimer();
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const llmHelper = voiceClient?.getHelper("llm") as LLMHelper;
    if (llmHelper) {
      await llmHelper.appendToMessages(
        {
          role: "user",
          content: inputText,
        },
        true
      );
      trackEvent("session", "text-message-sent", { userId: user?.userId });
      addMessage({ from: 'user', text: inputText, sentAt: new Date() });
    }

    setInputText("");
  };

  if (!voiceClient || !voiceClient.connected) return null;

  return (
    <InputWithButton
      ref={inputRef}
      value={inputText}
      onChange={handleInputChange}
      onButtonClick={handleSend}
      placeholder="Type your message..."
      buttonLabel={<Image src="/icons/feather-send.svg" alt="Send" width={28} height={28} />}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSend();
        }
      }}
    />
  );
};

export default TextMessageInput; 