import { DocumentData } from "firebase/firestore";

type role = 'user' | 'assistant';

export interface JournalConversationEntry {
  from: role;
  text: string;
  sentAt: Date;
}

export class JournalEntry {
  id: string;
  createdAt: Date;
  conversation: JournalConversationEntry[];
  startTime?: Date;
  endTime?: Date;
  content?: string;
  summary?: string;

  constructor(entryId: string, createdAt: Date) {
    this.id = entryId;
    this.createdAt = createdAt;
    this.content = '';
    this.conversation = [];
  }

  addConversationEntry(entry: JournalConversationEntry) {
    if (this.conversation.length === 0) this.startTime = entry.sentAt;
    this.conversation.push(entry);
    this.endTime = entry.sentAt;
  }

  static toJournalEntry(document: DocumentData): JournalEntry {
    if (!document.id || !document.createdAt) throw new Error(`Document did not contain entryId or cr: ${document.toString()}`);
    const entry = new JournalEntry(document.id, document.createdAt.toDate());

    if (!!document.startTime) entry.startTime = document.startTime;
    if (!!document.endTime) entry.endTime = document.endTime;
    if (!!document.content) entry.content = document.content;
    if (!!document.summary) entry.summary = document.summary;

    return entry;
  }

  static toJournalEntries(document: DocumentData[]): JournalEntry[] {
    return document.map(doc => JournalEntry.toJournalEntry(doc));
  }
}