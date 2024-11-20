import { DocumentData } from "firebase/firestore";

type role = 'user' | 'assistant';

export interface JournalConversationEntry {
  from: role;
  text: string;
  sentAt: Date;
}

export interface JournalEntry {
  id: string;
  createdAt: Date;
  conversation: JournalConversationEntry[];
  startTime?: Date;
  endTime?: Date;
  summary?: string;
}

export function toJournalEntry(document: DocumentData): JournalEntry {
  if (!document.id || !document.createdAt) throw new Error(`Document did not contain entryId or cr: ${document.toString()}`);

  const entry: JournalEntry = {
    id: document.id,
    createdAt: document.createdAt,
    ...(!!document.conversation ? { conversation: document.conversation } : { conversation: [] }),
    ...(!!document.startTime && { startTime: document.startTime }),
    ...(!!document.endTime && { endTime: document.endTime }),
    ...(!!document.summary && { summary: document.summary }),
  }

  return entry;
}

export function toJournalEntries(document: DocumentData[]): JournalEntry[] {
  return document.map(doc => toJournalEntry(doc));
}

export function addConversationEntry(entry: JournalEntry, conversationEntry: JournalConversationEntry) {
  if (entry.conversation.length === 0) entry.startTime = conversationEntry.sentAt;
  entry.conversation.push(conversationEntry);
  entry.endTime = conversationEntry.sentAt;
};
