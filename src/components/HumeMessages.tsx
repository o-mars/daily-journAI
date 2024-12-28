// ./components/Messages.tsx
"use client";
import { useVoice } from "@humeai/voice-react";
import { useEffect, useRef, useState } from 'react';
import { transformHumeMessages } from '@/src/services/humeMessageTransformerService';
import { JournalConversationEntry } from '@/src/models/journal.entry';

export default function HumeMessages() {
  const { messages: recentMessages } = useVoice();
  const [allMessages, setAllMessages] = useState<JournalConversationEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recentMessages.length === 0) return;

    const transformedRecent = transformHumeMessages(recentMessages);
    
    setAllMessages(prevMessages => {
      if (prevMessages.length === 0) return transformedRecent;

      // Find the oldest message in the recent messages
      const oldestRecentMessage = transformedRecent[0];
      
      // Find where this message exists in our previous messages (if it does)
      const overlapIndex = prevMessages.findIndex(
        msg => msg.from === oldestRecentMessage.from && 
              msg.text === oldestRecentMessage.text
      );

      if (overlapIndex === -1) {
        // No overlap found, append all new messages
        return [...prevMessages, ...transformedRecent];
      }

      // Replace overlapping portion with new messages
      return [
        ...prevMessages.slice(0, overlapIndex),
        ...transformedRecent
      ];
    });
  }, [recentMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages]);

  return (
    <div
      ref={scrollRef}
      className="w-full pt-4 rounded-lg overflow-y-scroll flex-grow"
      style={{ height: 'calc(100vh - 120px)' }}
      data-conversation-content
    >
      {allMessages.map((msg, index) => (
        <div 
          key={index}
          className={`mb-2 flex flex-row ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[70%] px-3 py-2 rounded-2xl ${
              msg.from === 'user'
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-gray-200 text-black rounded-bl-none'
            }`}
            style={{ wordWrap: 'break-word' }}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
