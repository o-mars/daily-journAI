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

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await getUser(userId);
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
