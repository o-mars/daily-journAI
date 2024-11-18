import { saveJournalEntry } from "@/src/client/firebase.service.client";
import { JournalConversationEntry } from "@/src/models/journal.entry";
import React, { useState, useRef, useEffect } from "react";
import { BotLLMTextData, RTVIEvent, TranscriptData } from "realtime-ai";
import { useRTVIClientEvent } from "realtime-ai-react";

const Conversation: React.FC = () => {
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript)
  useRTVIClientEvent(RTVIEvent.BotLlmText, handleBotLLmText);
  useRTVIClientEvent(RTVIEvent.BotLlmStopped, commitBotText);
  useRTVIClientEvent(RTVIEvent.BotTranscript, (text) => console.log('Bot transcript: ' + text));
  useRTVIClientEvent(RTVIEvent.BotTtsText, (text) => console.log('BOT TTS:  ', text));
  useRTVIClientEvent(RTVIEvent.Disconnected, handleDisconnect);
  useRTVIClientEvent(RTVIEvent.BotReady, () => console.log('bot is ready!!'));
  useRTVIClientEvent(RTVIEvent.BotConnected, () => console.log('bot is connected!!'));

  // useRTVIClientEvent(RTVIEvent.LLMFunctionCall, handleFoo);

  const botTextStream = useRef<string[]>([]);
  const [messages, setMessages] = useState<JournalConversationEntry[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function handleBotLLmText({ text }: BotLLMTextData) {
    botTextStream.current.push(text);
  }

  function commitBotText() {
    const text = botTextStream.current.join('');
    botTextStream.current = [];
    setMessages((prevMessages) => [...prevMessages, { from: 'assistant', sentAt: new Date(), text }]);
  }

  function handleUserTranscript(data: TranscriptData): void {
    if (data.final) setMessages((prevMessages) => [...prevMessages, { from: 'user', text: data.text, sentAt: new Date(data.timestamp) }]);
  }
  
  async function handleDisconnect() {
    const didUserInteract = messages.filter(message => message.from === 'user').length > 0;
    if (didUserInteract) {
      await saveJournalEntry(messages);
    } else {
      console.log('no user input, not doing save on journal entry');
    }
    setMessages([]);
  }

  return (
    <div style={{ width: '60%', border: '1px solid #ccc', margin: '20px', borderRadius: '8px', overflowY: 'scroll', height: '150px', flexGrow: 1 }} data-conversation-content>
      {messages.map((message, index) => (
        <div 
          key={index} 
          style={{
            marginBottom: '8px', 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'flex-start'
          }}
        >
          <strong 
            style={{
              paddingLeft: '8px',
              minWidth: '80px',
              fontWeight: 'bold', 
              marginRight: '8px', 
              color: message.from === 'user' ? 'cyan' : 'magenta'
            }}
          >
            {message.from === 'user' ? 'User' : 'JournAI'}:
          </strong>
          <span style={{ wordWrap: 'break-word', flex: 1, paddingRight: '8px' }}>{message.text}</span>
        </div>
      ))}
    </div>
  );
};

export default Conversation;