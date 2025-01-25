"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { useEffect, useState } from "react";
import HumeMinimalLayout from "./HumeMinimalLayout";
import HumeLayout from "./HumeLayout";

const MOBILE_BREAKPOINT = 320;

export default function HumeClient({
  accessToken,
  configId,
}: {
  accessToken: string;
  configId: string;
}) {
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
      configId={configId}
    >
      {isMinimal ? <HumeMinimalLayout /> : <HumeLayout />}
    </VoiceProvider>
  );
}
