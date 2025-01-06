import { useVoice } from "@humeai/voice-react";
import InputWithButton from "../InputWithButton";
import { useState } from "react";

export default function HumeEchoInput() {
  const [inputText, setInputText] = useState("");
  const { sendAssistantInput } = useVoice();

  const handleSend = () => {
    if (inputText.trim()) {
      sendAssistantInput(inputText);
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