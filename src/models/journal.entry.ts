import { DocumentData } from "firebase/firestore";

export class JournalEntry {
  entryId: string;
  startTime: Date;
  endTime: Date;
  content: string;
  summary?: string;

  constructor(entryId: string, startTime: Date) {
    this.entryId = entryId;
    this.startTime = startTime;
    this.endTime = startTime;
    this.content = '';
  }

  static toJournalEntry(document: DocumentData): JournalEntry {
    if (!document.entryId || !document.startTime) throw new Error(`Document did not contain entryId or startTime: ${document}`);
    const entry = new JournalEntry(document.entryId, document.startTime.toDate());

    if (!!document.endTime) entry.endTime = document.endTime.toDate();
    if (!!document.content) entry.content = document.content;
    if (!!document.summary) entry.summary = document.summary;

    return entry;
  }

  static toJournalEntries(document: DocumentData[]): JournalEntry[] {
    return document.map(doc => JournalEntry.toJournalEntry(doc));
  }
}