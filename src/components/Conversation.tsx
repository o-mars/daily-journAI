import { saveMoodEntries } from "@/src/client/firebase.service.client";
import { analyzeTranscriptForMoods } from "@/src/client/openai.service.client";
import React, { useState, useEffect, useRef } from "react";
import { BotLLMTextData, LLMFunctionCallData, RTVIClientConfigOption, RTVIError, RTVIEvent, TranscriptData } from "realtime-ai";
import { useRTVIClient, useRTVIClientTransportState, useRTVIClientEvent } from "realtime-ai-react";

interface Message {
  from: string;
  text: string;
}

const Conversation: React.FC = () => {
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript)
  useRTVIClientEvent(RTVIEvent.BotLlmText, handleBotLLmText);
  useRTVIClientEvent(RTVIEvent.BotLlmStopped, commitBotText);
  // useRTVIClientEvent(RTVIEvent.BotTranscript, handleBotTranscript)
  // useRTVIClientEvent(RTVIEvent.BotTtsText, (text) => console.log('BOT TTS:  ', text));
  useRTVIClientEvent(RTVIEvent.Disconnected, handleDisconnect);

  useRTVIClientEvent(RTVIEvent.LLMFunctionCall, handleFoo);

  const botTextStream = useRef<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  function handleBotLLmText({ text }: BotLLMTextData) {
    botTextStream.current.push(text);
  }

  function commitBotText() {
    const text = botTextStream.current.join('');
    console.log('commit');
    botTextStream.current = [];
    setMessages((prevMessages) => [...prevMessages, { from: 'JournAI', text }]);
  }

  function handleUserTranscript(data: TranscriptData): void {
    console.log('user transcript');
    if (data.final) setMessages((prevMessages) => [...prevMessages, { from: 'User', text: data.text }]);
  }
  
  function handleBotTranscript(data: BotLLMTextData): void {
    console.log('bot transcript');
    setMessages((prevMessages) => [...prevMessages, { from: 'JournAI', text: data.text }]);
  }

  async function handleDisconnect() {
    const transcriptChunks = [];
    messages.map(message => transcriptChunks.push(`${message.from}: ${message.text}`));
    
    const completeTranscript = messages.map(message => `${message.from}: ${message.text}.`).join(' ');
    const moodPartials = await analyzeTranscriptForMoods(completeTranscript);
    console.log('open ai analysis: ', moodPartials);
    await saveMoodEntries(moodPartials);
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