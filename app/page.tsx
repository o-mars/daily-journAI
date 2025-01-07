"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/src/contexts/HeaderContext";
import { useUser } from "@/src/contexts/UserContext";

export default function Home() {
  const { user, isInitialized } = useUser();
  const { branding } = useHeader();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) router.push("/welcome");
    // else if (user.profile.isAnonymous || !user.profile.email) router.push("/auth");
    else if (user?.isNewUser) {
      router.push('/start');
    }
    else router.push("/journals");
  }, [router, user, isInitialized]);

  return (
    <>
      <main className="flex min-h-[100svh] flex-col items-center justify-between p-12">
        <h1 className="text-4xl font-bold">{branding.appName}</h1>
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      </main>
    </>
  );
}
