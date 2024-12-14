import { JOURNAL_ENTRY_TITLE_DEFAULT, SUMMARY_NONE } from "@/src/models/constants";
import { DocumentData } from "firebase/firestore";

type role = 'user' | 'assistant';

export interface JournalEntryMetadata {
  userId: string;
  journalEntryId: string;
  type: string;
  duration: number;

  userEntries: number;
  assistantEntries: number;

  inputLength: number;
  outputLength: number;

  email?: string;
}

export interface JournalEntrySummary {
  summary: string;
  title: string;
  metadata: JournalEntryMetadata;
  createdAt: Date;
}

export const defaultJournalEntryMetadata: JournalEntryMetadata = {
  userId: '',
  journalEntryId: '',
  type: '',
  duration: 0,
  userEntries: 0,
  assistantEntries: 0,
  inputLength: 0,
  outputLength: 0,
};

export const defaultJournalEntry: JournalEntry = {
  id: '',
  createdAt: new Date(),
  conversation: [],
  summary: SUMMARY_NONE,
  title: JOURNAL_ENTRY_TITLE_DEFAULT,
};

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

  title?: string;
  userTitle?: string;
  transformedEntry?: string;

  type?: string; // bot type

  // lastUpdatedAt?: Date;
  metadata?: JournalEntryMetadata;
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
    ...(!!document.title && { title: document.title }),
    ...(!!document.userTitle && { userTitle: document.userTitle }),
    ...(!!document.transformedEntry && { transformedEntry: document.transformedEntry }),
    ...(!!document.type && { type: document.type }),
    ...(!!document.metadata && { metadata: document.metadata }),
    ...(!!document.lastUpdatedAt && { lastUpdatedAt: document.lastUpdatedAt }),
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
