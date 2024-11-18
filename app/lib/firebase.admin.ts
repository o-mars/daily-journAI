import admin from "firebase-admin";

import { User } from "@/src/models/user";
import { Mood } from "@/src/models/mood";
import { JournalConversationEntry, JournalEntry } from "@/src/models/journal.entry";
import { generateSummary } from "@/app/lib/openai.admin";


if (!admin.apps.length) {
  const firebaseKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseKey),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();

export async function getUser(userId: string): Promise<User> {
  try {
    const userDocRef = db.doc(`test/${userId}`);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      const user = User.toUser(docSnap.data()!);
      return user;
    } else {
      const user = new User(userId, new Date());
      await userDocRef.set(user);
      return user;
    }
  } catch (error) {
    throw error;
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  try {
    const userDocRef = db.doc(`test/${userId}`);
    await userDocRef.update(userData);
  } catch (error) {
    throw error;
  }
}

export async function addJournalEntry(userId: string, conversation: JournalConversationEntry[]): Promise<JournalEntry> {
  try {
    const summary = await generateSummary(conversation);

    const startTime = conversation[0].sentAt;
    const endTime = conversation[conversation.length-1].sentAt;
    const { FieldValue } = admin.firestore;
    const journalEntriesCollectionRef = db.collection(`test/${userId}/journalEntries`);
    const journalEntryDocRef = await journalEntriesCollectionRef.add({ conversation, summary, startTime, endTime, createdAt: FieldValue.serverTimestamp() });

    const document = await journalEntryDocRef.get();
    console.log('created journalEntry: ', document.data());

    return JournalEntry.toJournalEntry({id: document.id, ...document.data()});
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
}

export async function getRecentJournalEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const usersMoodCollectionRef = db.collection(`test/${userId}/journalEntries`);
    const querySnapshot = await usersMoodCollectionRef
      .where("createdAt", ">=", oneWeekAgo)
      .orderBy("createdAt", "desc")
      .get();

    const recentJournalEntries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      recentJournalEntries.push(JournalEntry.toJournalEntry({ id: doc.id, ...doc.data() }));
    });

    return recentJournalEntries;
  } catch (error) {
    throw error;
  }
}

export async function getJournalEntriesCount(userId: string): Promise<number> {
  try {
    const usersJournalEntriesCollectionRef = db.collection(`test/${userId}/journalEntries`);
    const querySnapshot = await usersJournalEntriesCollectionRef.get();
    return querySnapshot.size;
  } catch (error) {
    throw error;
  }
}
