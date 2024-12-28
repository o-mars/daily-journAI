"use client";

import { VoiceProvider } from "@humeai/voice-react";
import HumeLayout from "@/src/components/HumeLayout";
import { DEFAULT_HUME_CONFIG_ID } from "@/src/models/constants";

export default function HumeClient({
  accessToken,
}: {
  accessToken: string;
}) {
  return (
    <VoiceProvider
      auth={{ type: "accessToken", value: accessToken }}
      configId={DEFAULT_HUME_CONFIG_ID}
    >
      <HumeLayout />
    </VoiceProvider>
  );
}
