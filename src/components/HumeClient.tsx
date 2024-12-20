"use client";

import { VoiceProvider } from "@humeai/voice-react";
import HumeLayout from "@/src/components/HumeLayout";

export default function HumeClient({
  accessToken,
}: {
  accessToken: string;
}) {
  return (
    <VoiceProvider
      auth={{ type: "accessToken", value: accessToken }}
      configId={process.env.NEXT_PUBLIC_HUME_CONFIG_ID || '1eb3dbb0-9501-43a7-9079-e9e576185d71'}
    >
      <HumeLayout />
    </VoiceProvider>
  );
}
