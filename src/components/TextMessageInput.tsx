import React, { useState } from "react";
import { useRTVIClient } from "realtime-ai-react";
import { useMessageContext } from "@/src/contexts/MessageContext";
import { LLMHelper } from "realtime-ai";
import Image from "next/image";


const TextMessageInput: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const voiceClient = useRTVIClient();
  const { addMessage } = useMessageContext();

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const llmHelper = voiceClient?.getHelper("llm") as LLMHelper;
    if (llmHelper) {
      const response = await llmHelper.appendToMessages(
        {
          role: "user",
          content: inputText,
        },
        true
      );
      console.log('response: ', response);

      // Add the message to the local context
      addMessage({ from: 'user', text: inputText, sentAt: new Date() });
    }

    setInputText(""); // Clear the input field
  };

  if (!voiceClient || !voiceClient.connected) return null;

  return (
    <div className="flex items-center pb-2">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
        placeholder="Type your message..."
        className="flex-grow p-2 border rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
      />
      <button onClick={handleSend} className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        <Image src="/icons/feather-send.svg" alt="Send" width={28} height={28} />
      </button>
    </div>
  );
};

export default TextMessageInput; 