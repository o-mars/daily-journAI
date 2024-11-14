import { useEffect, useState } from "react";
import { getUser } from "../client/firebase.service.client";
import { User } from "@/src/models/user";
import { onAuthStateChanged, getAuth } from "firebase/auth";

export const useUserData = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('auth changed: ', user);
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
    console.log(userId);
    if (!userId) return;

    const fetchUserData = async () => {
      console.log('fetching user data');
      setIsLoading(true);
      setError(null);

      try {
        console.log('fetching user...');
        const user = await getUser(userId);
        console.log('useUser got user: ', user);
        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { user, isLoading, error };
};
