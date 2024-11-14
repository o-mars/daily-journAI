import { User } from "@/src/models/user";
import { db } from "../../firebase.config";
import { collection, doc, DocumentData, getDoc, getDocs, setDoc } from "firebase/firestore";
import { JournalEntry } from "@/src/models/journal.entry";
import { getAuth } from "firebase/auth";

export const USER_PATH = 'test';

export async function getUser(userId: string): Promise<User> {
  try {
    const userDocRef = doc(db, USER_PATH, userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data: DocumentData = docSnap.data();
      const user = User.toUser(data);
      return user;
    } else {
      const user = new User(userId, new Date());
      await setDoc(userDocRef, user);
      return user;
    }
  } catch (error) {
    throw error;
  }
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const journalEntriesRef = collection(db, USER_PATH, userId, "journalEntries");
    const snapShot = await getDocs(journalEntriesRef);

    if (snapShot.empty) return [];

    const journalEntries = JournalEntry.toJournalEntries(snapShot.docs);
    return journalEntries;
  } catch (error) {
    throw error;
  }
}

export async function getUserWithJournalEntries(userId: string): Promise<User> {
  try {
    const [user, entries] = await Promise.all([getUser(userId), getJournalEntries(userId)]);
    if (entries) user.journalEntries = entries;
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
  try {
    const userDocRef = doc(db, USER_PATH, userId);
    await setDoc(userDocRef, userData, { merge: true });
  } catch (error) {
    throw error;
  }
}
