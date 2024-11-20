import { useEffect, useState } from "react";
import { toUser, User } from "@/src/models/user";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import { USER_PATH } from "@/src/models/constants";
import { getRecentJournalEntries, getUser } from "@/src/client/firebase.service.client";
import { JournalEntry } from "@/src/models/journal.entry";

export const useUserData = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    // Watch for user document changes
    const userUnsubscribe = onSnapshot(
      doc(db, USER_PATH, userId),
      async (docSnapshot) => {
        console.log('userSnapshot: ', docSnapshot);
        if (!docSnapshot.exists()) {
          const newUser = await getUser(userId);
          setUser(newUser);
          // setError("User not found");
          setIsLoading(false);
          return;
        }
        const userData = docSnapshot.data();
        const updatedUser = toUser(userData);
        updatedUser.journalEntries = journalEntries;
        setUser(updatedUser);
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );

    // // Watch for journal entries collection changes
    const journalUnsubscribe = onSnapshot(
      collection(db, USER_PATH, userId, "journalEntries"),
      async (snapshot) => {
        const recentEntries = snapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          }
        }).slice(0, 5); // Get 5 most recent entries
        console.log('journalEntriesSnapshot: ', recentEntries);
        const entries = await getRecentJournalEntries();
        setJournalEntries(entries);
        console.log('entries: ', entries);
        setUser(prevUser => {
          if (prevUser) {
            const newUser: User = {
              ...prevUser,
              isNewUser: false,
              journalEntries: entries,
            };
            return newUser;
          }
          return null;
        });
      },
      (error) => {
        setError(error.message);
      }
    );

    return () => {
      userUnsubscribe();
      journalUnsubscribe();
    };
  }, [userId]);

  return { user, isLoading, error };
};
