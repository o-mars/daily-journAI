import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase.config";
import { getUser } from "@/src/client/firebase.service.client";
import { User } from "@/src/models/user";

const UserContext = createContext<{
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
}>({ user: null, isLoading: true, error: null, fetchUser: async () => {} });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

    // Check initial auth state
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }

    return () => unsubscribe();
  }, []);


  const fetchUser = async () => {
    if (!userId) return;
    setIsLoading(true);
    const newUser = await getUser(userId);
    setIsLoading(false);
    setError(null);
    setUser(newUser);
  }

  useEffect(() => {
    if (!userId) return;

    fetchUser();

    return () => {
    };
  }, [userId]);

  return (
    <UserContext.Provider value={{ user, isLoading, error, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);