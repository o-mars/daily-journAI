"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { UserProvider } from "@/src/contexts/UserContext";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/main");
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <UserProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold">JournAI</h1>
        <div> Please Wait... redirecting based on auth state... </div>
      </main>
    </UserProvider>
  );
}
