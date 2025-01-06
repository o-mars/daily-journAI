import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import InputWithButton from "../InputWithButton";
import { useEffect, useRef, useState } from "react";

export default function HumeTextInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState("");
  const { sendUserInput, readyState } = useVoice();

  useEffect(() => {
    if (readyState === VoiceReadyState.OPEN) {
      inputRef.current?.focus();
    }
  }, [readyState]);
  
  const handleSend = () => {
    if (inputText.trim()) {
      sendUserInput(inputText);
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputWithButton
      ref={inputRef}
      value={inputText}
      onChange={setInputText}
      onButtonClick={handleSend}
      onKeyDown={handleKeyDown}
      placeholder="Type your message..."
      buttonLabel="Send"
      shouldShowButton={false}
      variant="underline"
    />
  );
} 