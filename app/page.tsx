"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { useHeader } from "@/src/contexts/HeaderContext";

export default function Home() {
  const { branding } = useHeader();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/main");
      } else {
        router.push("/welcome");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold">{branding.appName}</h1>
        <div> Please Wait... redirecting... </div>
      </main>
    </>
  );
}
