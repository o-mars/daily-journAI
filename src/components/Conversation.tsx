import { saveJournalEntry } from "@/src/client/firebase.service.client";
import { JournalConversationEntry } from "@/src/models/journal.entry";
import React, { useState, useRef } from "react";
import { BotLLMTextData, RTVIEvent, TranscriptData } from "realtime-ai";
import { useRTVIClientEvent } from "realtime-ai-react";

const Conversation: React.FC = () => {
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript)
  useRTVIClientEvent(RTVIEvent.BotLlmText, handleBotLLmText);
  useRTVIClientEvent(RTVIEvent.BotLlmStopped, commitBotText);
  // useRTVIClientEvent(RTVIEvent.BotTranscript, handleBotTranscript)
  // useRTVIClientEvent(RTVIEvent.BotTtsText, (text) => console.log('BOT TTS:  ', text));
  useRTVIClientEvent(RTVIEvent.Disconnected, handleDisconnect);

  // useRTVIClientEvent(RTVIEvent.LLMFunctionCall, handleFoo);

  const botTextStream = useRef<string[]>([]);
  const [messages, setMessages] = useState<JournalConversationEntry[]>([]);

  function handleBotLLmText({ text }: BotLLMTextData) {
    botTextStream.current.push(text);
  }

  function commitBotText() {
    const text = botTextStream.current.join('');
    console.log('commit');
    botTextStream.current = [];
    setMessages((prevMessages) => [...prevMessages, { from: 'assistant', sentAt: new Date(), text }]);
  }

  function handleUserTranscript(data: TranscriptData): void {
    console.log('user transcript');
    if (data.final) setMessages((prevMessages) => [...prevMessages, { from: 'user', text: data.text, sentAt: new Date(data.timestamp) }]);
  }
  
  async function handleDisconnect() {
    const didUserInteract = messages.filter(message => message.from === 'user').length > 0;
    if (didUserInteract) {
      await saveJournalEntry(messages);
    } else {
      console.log('no user input, not doing save on journal entry');
    }
    // const transcriptChunks = [];
    // messages.map(message => transcriptChunks.push(`${message.from}: ${message.text}`));
    
    // const completeTranscript = messages.map(message => `${message.from}: ${message.text}.`).join(' ');
    // const summary = await analyzeTranscriptForSummary(completeTranscript);

    // console.log('open ai analysis: ', summary);
  }

  // function handleFoo(data: LLMFunctionCallData) {
  //   // data.function_name
  // }

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