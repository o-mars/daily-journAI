import admin from "firebase-admin";

import { User } from "@/src/models/user";
import { Mood } from "@/src/models/mood";


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

export async function addMoodEntries(userId: string, moodData: Partial<Mood[]>): Promise<boolean> {
  try {
    const { FieldValue } = admin.firestore;
    const batch = db.batch();
    moodData.forEach(el => {
      const docRef = db.collection(`test/${userId}/mood`).doc();
      batch.set(docRef, {...el, createdAt: FieldValue.serverTimestamp()});
    });
    batch.commit();

    console.log('created moods!');
    return true;
  } catch (error) {
    console.error("Error creating mood entry:", error);
    return false;
  }
}

export async function getRecentMood(userId: string): Promise<Mood[]> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const usersMoodCollectionRef = db.collection(`test/${userId}/mood`);
    const querySnapshot = await usersMoodCollectionRef
      .where("createdAt", ">=", oneWeekAgo)
      .orderBy("createdAt", "desc")
      .get();

    const recentMoodEntries: Mood[] = [];
    querySnapshot.forEach((doc) => {
      recentMoodEntries.push(Mood.toMood(doc.data()));
    });

    return recentMoodEntries;
  } catch (error) {
    throw error;
  }
}

export async function getMoodCount(userId: string): Promise<number> {
  try {
    const usersMoodCollectionRef = db.collection(`test/${userId}/mood`);
    const querySnapshot = await usersMoodCollectionRef.get();
    return querySnapshot.size;
  } catch (error) {
    throw error;
  }
}
