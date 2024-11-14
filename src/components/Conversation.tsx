import React, { useState, useEffect } from "react";
import { BotLLMTextData, LLMFunctionCallData, RTVIClientConfigOption, RTVIError, RTVIEvent, TranscriptData } from "realtime-ai";
import { useRTVIClient, useRTVIClientTransportState, useRTVIClientEvent } from "realtime-ai-react";

interface Message {
  from: string;
  text: string;
}

const Conversation: React.FC = () => {
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript)
  useRTVIClientEvent(RTVIEvent.BotTranscript, handleBotTranscript)
  useRTVIClientEvent(RTVIEvent.Disconnected, handleDisconnect);

  useRTVIClientEvent(RTVIEvent.LLMFunctionCall, handleFoo);

  const [messages, setMessages] = useState<Message[]>([]);

  function handleUserTranscript(data: TranscriptData): void {
    if (data.final) setMessages((prevMessages) => [...prevMessages, { from: 'User', text: data.text }]);
  }
  
  function handleBotTranscript(data: BotLLMTextData): void {
    setMessages((prevMessages) => [...prevMessages, { from: 'JournAI', text: data.text }]);
  }

  function handleDisconnect() {
    console.log('todo: disconnect logic in conversation.. to save the convo log?')
  }

  function handleFoo(data: LLMFunctionCallData) {
    // data.function_name
  }

  return (
    <div>
      <span>Log:</span>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.from}:</strong> {message.text}
        </div>
      ))}
    </div>
  );
};

export default Conversation;