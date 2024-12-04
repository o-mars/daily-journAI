import React, { useEffect, useRef } from "react";
import { JournalConversationEntry } from "@/src/models/journal.entry";
import { useJournalEntryContext } from "@/src/contexts/JournalEntryContext";

interface ConversationProps {
  messages?: JournalConversationEntry[];
}

const Conversation: React.FC<ConversationProps> = ({ messages: staticMessages }) => {
  const { messages: liveMessages, isTextInputVisible } = useJournalEntryContext();
  const messages = staticMessages || liveMessages;  // Use static messages if provided, otherwise live
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
    <div
      style={{
        width: '100%',
        paddingTop: '16px',
        borderRadius: '8px',
        overflowY: 'scroll',
        height: staticMessages ? 'auto' : `calc(100vh - ${isTextInputVisible ? 170 : 120}px)`,
        flexGrow: 1
      }}
      data-conversation-content
    >
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