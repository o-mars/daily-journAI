import React, { useEffect, useRef } from "react";
import { useMessageContext } from "@/src/contexts/MessageContext";

const Conversation: React.FC = () => {
  const { messages } = useMessageContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ width: '100%', paddingTop: '16px', borderRadius: '8px', overflowY: 'scroll', height: 'calc(100vh - 120px)', flexGrow: 1 }} data-conversation-content>
      {messages.map((message, index) => (
        <div 
          key={index} 
          style={{
            marginBottom: '8px', 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: message.from === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          <div 
            style={{
              maxWidth: '70%',
              padding: '8px 12px',
              borderRadius: '18px',
              backgroundColor: message.from === 'user' ? '#007AFF' : '#E5E5EA',
              color: message.from === 'user' ? 'white' : 'black',
              wordWrap: 'break-word',
              borderBottomLeftRadius: message.from !== 'user' ? 0 : '18px',
              borderBottomRightRadius: message.from !== 'user' ? '18px' : 0,
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