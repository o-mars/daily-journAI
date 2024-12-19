import { JournalConversationEntry } from "@/src/models/journal.entry";
import { JSONMessage, ConnectionMessage } from "@humeai/voice-react";

export function transformHumeMessage(humeMessage: JSONMessage): JournalConversationEntry {
  let content: string;
  let from: 'user' | 'assistant';

  switch (humeMessage.type) {
    case 'user_message':
      content = humeMessage.message.content ?? '';
      from = 'user';
      break;
    case 'assistant_message':
      content = humeMessage.message.content ?? '';
      from = 'assistant';
      break;
    default:
      throw new Error(`Unsupported message type: ${humeMessage.type}`);
  }

  return {
    from,
    text: content,
    sentAt: new Date(humeMessage.receivedAt),
  };
}

export function transformHumeMessages(humeMessages: (JSONMessage | ConnectionMessage)[]): JournalConversationEntry[] {
  return humeMessages.filter(message => message.type === 'user_message' || message.type === 'assistant_message').map(transformHumeMessage);
}
