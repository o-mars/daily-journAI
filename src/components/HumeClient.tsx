"use client";

import { VoiceProvider } from "@humeai/voice-react";
import HumeLayout from "@/src/components/HumeLayout";
import { DEFAULT_HUME_CONFIG_ID } from "@/src/models/constants";
import { useUser } from "@/src/contexts/UserContext";

export default function HumeClient({
  accessToken,
}: {
  accessToken: string;
}) {
  const { user } = useUser();
  return (
    <VoiceProvider
      auth={{ type: "accessToken", value: accessToken }}
      configId={user?.preferences.humeConfigId.id ?? DEFAULT_HUME_CONFIG_ID}
    >
      <HumeLayout />
    </VoiceProvider>
  );
}
