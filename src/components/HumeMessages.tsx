// ./components/Messages.tsx
"use client";
import { useVoice } from "@humeai/voice-react";
import { useEffect, useRef } from 'react';

export default function HumeMessages() {
  const { messages } = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="w-full pt-4 rounded-lg overflow-y-scroll flex-grow"
      style={{
        height: 'calc(100vh - 170px)',
      }}
      data-conversation-content
    >
      {messages.map((msg, index) => {
        if (msg.type === "user_message" || msg.type === "assistant_message") {
          const isUser = msg.type === "user_message";
          return (
            <div 
              key={msg.type + index}
              className={`mb-2 flex flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                  isUser 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-black rounded-bl-none'
                }`}
                style={{ wordWrap: 'break-word' }}
              >
                {msg.message.content}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
