"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { DEFAULT_HUME_CONFIG_ID } from "@/src/models/constants";
import { useUser } from "@/src/contexts/UserContext";
import HumeMinimalLayout from "@/src/components/HumeMinimalLayout";
import HumeLayout from "@/src/components/HumeLayout";
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 320;

export default function HumeClient({
  accessToken,
}: {
  accessToken: string;
}) {
  const { user } = useUser();
  const [isMinimal, setIsMinimal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMinimal(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <VoiceProvider
      auth={{ type: "accessToken", value: accessToken }}
      configId={user?.preferences.humeConfigId.id ?? DEFAULT_HUME_CONFIG_ID}
    >
      {isMinimal ? <HumeMinimalLayout /> : <HumeLayout />}
    </VoiceProvider>
  );
}
