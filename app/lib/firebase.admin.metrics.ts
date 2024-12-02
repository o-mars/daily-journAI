import admin from "firebase-admin";
import { db } from "@/app/lib/firebase.admin";
import { JournalEntryMetadata } from "@/src/models/journal.entry";
import { METRICS_JOURNAL_ENTRIES_PATH } from "@/src/models/constants";

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