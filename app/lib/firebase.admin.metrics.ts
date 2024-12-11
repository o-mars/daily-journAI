import admin from "firebase-admin";
import { db } from "@/app/lib/firebase.admin";
import { JournalEntryMetadata } from "@/src/models/journal.entry";
import { METRICS_JOURNAL_ENTRIES_PATH, METRICS_TELEPHONY_PATH, SUMMARIZED_JOURNAL_ENTRIES_PATH } from "@/src/models/constants";
import { TelephonyEvent } from "@/src/models/common";

export async function publishJournalEntryMetrics(metadata: JournalEntryMetadata): Promise<boolean> {
  try {
    await db.collection(METRICS_JOURNAL_ENTRIES_PATH).add({
      ...metadata,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error publishing metrics:", error);
    return false;
  }
}

export async function saveJournalEntryMetrics(metadata: JournalEntryMetadata, summary: string, title: string): Promise<boolean> {
  try {
    await db.collection(SUMMARIZED_JOURNAL_ENTRIES_PATH).add({
      ...metadata,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      summary,
      title,
    });
    return true;
  } catch (error) {
    console.error("Error publishing metrics:", error);
    return false;
  }
}

export async function addTelephonyEvent(event: TelephonyEvent): Promise<boolean> {
  try {
    await db.collection(METRICS_TELEPHONY_PATH).add({
      ...event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error adding telephony event:", error);
    return false;
  }
}