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
    if (user?.isNewUser) router.push("/main");
    else router.push("/journals");
  }, [router, user, isInitialized]);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold">{branding.appName}</h1>
        <div> Please Wait... redirecting... </div>
      </main>
    </>
  );
}
