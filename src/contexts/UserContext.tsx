import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase.config";
import { fetchUser, saveUpdatedUser } from "@/src/client/firebase.service.client";
import { User } from "@/src/models/user";

const UserContext = createContext<{
  user: User | null;
  isLoading: boolean;
  error: string | null;
  syncLocalUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}>({ user: null, isLoading: true, error: null, syncLocalUser: async () => {}, updateUser: async () => {} });

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


  const syncLocalUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const newUser = await fetchUser(userId);
    setIsLoading(false);
    setError(null);
    setUser(newUser);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    syncLocalUser();

    return () => {
    };
  }, [userId, syncLocalUser]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!userId || !user) return;
    
    try {
      setIsLoading(true);
      await saveUpdatedUser(data);
      
      // Update local state immediately
      const updatedUser = {
        ...user,
        ...data,
        profile: { ...user.profile, ...(data.profile || {}) },
        preferences: { ...user.preferences, ...(data.preferences || {}) }
      };
      setUser(updatedUser);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to update user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  return (
    <UserContext.Provider value={{ user, isLoading, error, syncLocalUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);