import admin from "firebase-admin";

import { defaultUser, toUser, User } from "@/src/models/user";
import { JournalConversationEntry, JournalEntry, toJournalEntry, JournalEntryMetadata } from "@/src/models/journal.entry";
import { generateSummary, generateTitle } from "@/app/lib/openai.admin";
import { JOURNAL_ENTRIES_PATH, MAX_JOURNAL_ENTRIES, USER_PATH } from "@/src/models/constants";
import { saveJournalEntryMetrics } from "@/app/lib/firebase.admin.metrics";


if (!admin.apps.length) {
  const firebaseKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseKey),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();

export async function getUser(userId: string, ): Promise<User> {
  try {
    const userDocRef = db.doc(`${USER_PATH}/${userId}`);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      const user = toUser(docSnap.data()!);
      console.log('user exists');
      return user;
    } else {
      const userRecord = await auth.getUser(userId);
      const isAnonymous = !userRecord.email && !userRecord.phoneNumber && userRecord.providerData.length === 0;

      const user: User = {
        ...defaultUser,
        userId,
        createdAt: new Date(),
        profile: {
          isAnonymous,
          ...userRecord.email ? { email: userRecord.email } : {},
          ...userRecord.phoneNumber ? { phone: userRecord.phoneNumber } : {},
        }
      };
      await userDocRef.set(user);
      console.log('created user');
      return user;
    }
  } catch (error) {
    throw error;
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  try {
    const userDocRef = db.doc(`${USER_PATH}/${userId}`);
    await userDocRef.update(userData);
  } catch (error) {
    throw error;
  }
}

export async function addJournalEntry(
  userId: string, 
  conversation: JournalConversationEntry[],
  metadata: JournalEntryMetadata
): Promise<JournalEntry> {
  try {
    const [
      summary,
      title,
      // transformedEntry
    ] = await Promise.all([
      generateSummary(conversation),
      generateTitle(conversation),
      // generateTransformedEntry(conversation)
    ]);

    const startTime = conversation[0].sentAt;
    const endTime = conversation[conversation.length-1].sentAt;
    const { FieldValue } = admin.firestore;
    const journalEntriesCollectionRef = db.collection(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}`);
    try {
      const journalEntryDocRef = await journalEntriesCollectionRef.add({
        conversation,
        summary,
        title,
        transformedEntry: '',
        startTime,
        endTime,
        createdAt: FieldValue.serverTimestamp(),
        metadata: {
          ...metadata,
          userId
        }
      });

      const document = await journalEntryDocRef.get();
      console.log('created journalEntry: ', document.data());
      void saveJournalEntryMetrics({...metadata, userId: userId, journalEntryId: document.id}, summary, title);

      return toJournalEntry({id: document.id, ...document.data()});
    } catch (error) {
      console.error("Error creating journal entry:", error);
      void saveJournalEntryMetrics({...metadata, userId: userId}, summary, title);
      throw error;
    }
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
}

export async function doNotAddJournalEntry(
  userId: string,
  conversation: JournalConversationEntry[],
  metadata: JournalEntryMetadata
): Promise<void> {
  try {
    const [
      summary,
      title,
    ] = await Promise.all([
      generateSummary(conversation),
      generateTitle(conversation),
    ]);
    
    void saveJournalEntryMetrics({ ...metadata, userId }, summary, title);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
}

export async function getRecentJournalEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

    const usersJournalEntriesCollectionRef = db.collection(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}`);
    const querySnapshot = await usersJournalEntriesCollectionRef
      .select("summary", "title", "startTime", "endTime", "createdAt", "metadata")
      .where("createdAt", ">=", oneWeekAgo)
      .where("summary", "!=", "None")
      .orderBy("createdAt", "desc")
      .limit(MAX_JOURNAL_ENTRIES)
      .get();

    const recentJournalEntries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      recentJournalEntries.push(toJournalEntry({ id: doc.id, ...doc.data() }));
    });

    return recentJournalEntries;
  } catch (error) {
    throw error;
  }
}

export async function getJournalEntry(userId: string, entryId: string): Promise<JournalEntry> {
  try {
    const usersJournalEntryDocumentRef = db.doc(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}/${entryId}`);
    const journalEntryDoc = await usersJournalEntryDocumentRef.get();

    const journalEntry = toJournalEntry({ id: journalEntryDoc.id, ...journalEntryDoc.data() });
    return journalEntry;
  } catch (error) {
    throw error;
  }
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const usersJournalEntriesCollectionRef = db.collection(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}`);
    const querySnapshot = await usersJournalEntriesCollectionRef
      .select("summary", "title", "startTime", "endTime", "createdAt", "metadata")
      .where("metadata.userEntries", ">", 1)
      .orderBy("createdAt", "desc")
      .get();

    const journalEntries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      journalEntries.push(toJournalEntry({ id: doc.id, ...doc.data() }));
    });

    return journalEntries;
  } catch (error) {
    throw error;
  }
}

export async function getJournalEntriesCount(userId: string): Promise<number> {
  try {
    const usersJournalEntriesCollectionRef = db.collection(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}`);
    const querySnapshot = await usersJournalEntriesCollectionRef.get();
    return querySnapshot.size;
  } catch (error) {
    throw error;
  }
}

export async function submitFeedback(userId: string, rating: number, comment: string, entryId: string = ''): Promise<boolean> {
  try {
    const { FieldValue } = admin.firestore;
    const feedbackCollectionRef = db.collection(`feedback`);
    const feedbackEntryDocRef = await feedbackCollectionRef.add({ userId, rating, comment, entryId, createdAt: FieldValue.serverTimestamp() });

    const document = await feedbackEntryDocRef.get();
    console.log('created feedback entry: ', document.data());

    return true;
  } catch (error) {
    console.error("Error creating feedback entry:", error);
    return false;
  }
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  try {
    const usersJournalEntryDocumentRef = db.doc(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}/${entryId}`);
    await usersJournalEntryDocumentRef.delete();
    console.log(`Deleted journal entry with ID: ${entryId}`);
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
}

export async function deleteAllJournalEntries(userId: string): Promise<void> {
  try {
    const usersJournalEntriesCollectionRef = db.collection(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}`);
    const snapshot = await usersJournalEntriesCollectionRef.get();
    const batchSize = 500;
    const batches = [];

    for (let i = 0; i < snapshot.size; i += batchSize) {
      const batch = db.batch();
      snapshot.docs.slice(i, i + batchSize).forEach((doc) => {
        batch.delete(doc.ref);
      });
      batches.push(batch.commit());
    }

    await Promise.all(batches);
    console.log(`Deleted all journal entries for user: ${userId}`);
  } catch (error) {
    console.error("Error deleting all journal entries:", error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await deleteAllJournalEntries(userId);
    const usersJournalEntryDocumentRef = db.doc(`${USER_PATH}/${userId}`);
    await usersJournalEntryDocumentRef.delete();
    await auth.deleteUser(userId);
    console.log(`Deleted user and all data with ID: ${userId}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function updateJournalEntry(userId: string, entryId: string, updates: Partial<JournalEntry>): Promise<void> {
  try {
    const usersJournalEntryDocumentRef = db.doc(`${USER_PATH}/${userId}/${JOURNAL_ENTRIES_PATH}/${entryId}`);
    await usersJournalEntryDocumentRef.update(updates);
    console.log(`Updated journal entry with ID: ${entryId}`);
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
}
