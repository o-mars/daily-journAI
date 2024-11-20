import { saveJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";
import { JournalConversationEntry } from "@/src/models/journal.entry";
import React, { useState, useRef, useEffect } from "react";
import { BotLLMTextData, RTVIEvent, TranscriptData } from "realtime-ai";
import { useRTVIClientEvent } from "realtime-ai-react";

const Conversation: React.FC = () => {
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript)
  useRTVIClientEvent(RTVIEvent.BotLlmText, handleBotLLmText);
  useRTVIClientEvent(RTVIEvent.BotLlmStopped, commitBotText);
  // useRTVIClientEvent(RTVIEvent.BotTranscript, (text) => console.log('Bot transcript: ' + text));
  // useRTVIClientEvent(RTVIEvent.BotTtsText, (text) => console.log('BOT TTS:  ', text));
  useRTVIClientEvent(RTVIEvent.Connected, () => setIsVisible(true));
  useRTVIClientEvent(RTVIEvent.Disconnected, handleDisconnect);
  // useRTVIClientEvent(RTVIEvent.BotReady, () => console.log('bot is ready!!'));
  // useRTVIClientEvent(RTVIEvent.BotConnected, () => console.log('bot is connected!!'));

  // useRTVIClientEvent(RTVIEvent.LLMFunctionCall, handleFoo);
  const [isVisible, setIsVisible] = useState(true);

  const botTextStream = useRef<string[]>([]);
  const [messages, setMessages] = useState<JournalConversationEntry[]>([]);

  const { fetchUser } = useUser();

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
    if (!data.final) return;
    setMessages((prevMessages) => {
      const wasPreviousSender = prevMessages.length > 0 && prevMessages[prevMessages.length-1].from === 'user';
      if (!wasPreviousSender) return [...prevMessages, { from: 'user', text: data.text, sentAt: new Date(data.timestamp) }];
      
      const untouchedMessages = prevMessages.filter((_, index) => index !== prevMessages.length - 1);
      untouchedMessages.push({ from: 'user', sentAt: new Date(data.timestamp), text: `${prevMessages[prevMessages.length-1].text} ${data.text}` });
      return untouchedMessages;
    });
  }
  
  async function handleDisconnect() {
    setIsVisible(false)
    const didUserInteract = messages.filter(message => message.from === 'user').length > 0;
    if (didUserInteract) {
      await saveJournalEntry(messages);
      await fetchUser();
    } else {
    }
    setMessages([]);
  }

  if (!isVisible) return null;

  return (
    <div style={{ width: '60%', margin: '20px', borderRadius: '8px', overflowY: 'scroll', height: '150px', flexGrow: 1 }} data-conversation-content>
      {messages.map((message, index) => (
        <div 
          key={index} 
          style={{
            marginBottom: '8px', 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start',
            paddingLeft: '8px',
            paddingRight: '8px'
          }}
        >
          <div 
            style={{
              maxWidth: '70%',
              padding: '8px 12px',
              borderRadius: '18px',
              backgroundColor: message.from === 'user' ? '#007AFF' : '#E5E5EA',
              color: message.from === 'user' ? 'white' : 'black',
              wordWrap: 'break-word'
            }}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Conversation;