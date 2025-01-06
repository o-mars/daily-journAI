// ./components/Messages.tsx
"use client";
import { useEffect, useRef } from 'react';
import { useHume } from '@/src/contexts/HumeContext';

export default function HumeMessages() {
  const { allMessages } = useHume();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages]);

  return (
    <div
      ref={scrollRef}
      className="w-full pt-4 rounded-lg overflow-y-scroll flex-grow"
      style={{ height: 'calc(100svh - 120px)' }}
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
