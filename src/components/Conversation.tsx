import { saveMoodEntries } from "@/src/client/firebase.service.client";
import { analyzeTranscriptForMoods } from "@/src/client/openai.service.client";
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
  const v = useRTVIClient();

  const [messages, setMessages] = useState<Message[]>([]);

  function handleUserTranscript(data: TranscriptData): void {
    if (data.final) setMessages((prevMessages) => [...prevMessages, { from: 'User', text: data.text }]);
  }
  
  function handleBotTranscript(data: BotLLMTextData): void {
    setMessages((prevMessages) => [...prevMessages, { from: 'JournAI', text: data.text }]);
  }

  async function handleDisconnect() {
    console.log('todo: disconnect logic in conversation.. to save the convo log?');

    const transcriptChunks = [];
    messages.map(message => transcriptChunks.push(`${message.from}: ${message.text}`));
    
    const completeTranscript = messages.map(message => `${message.from}: ${message.text}.`).join(' ');
    const moodPartials = await analyzeTranscriptForMoods(completeTranscript);
    console.log('open ai analysis: ', moodPartials);
    await saveMoodEntries(moodPartials);
    /*
     TODO: Take the entire transcript, and send it for post-convo analysis:
      - Ask the LLM to give you Mood[] from the text
      - Update User & User/Mood
     */
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