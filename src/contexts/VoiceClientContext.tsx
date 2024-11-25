import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { RTVIClient, LLMHelper, FunctionCallParams } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { getServices } from "@/src/models/user.preferences";
import { defaultUser, generateConfig } from "@/src/models/user";
import { useUser } from "@/src/contexts/UserContext";
import { RTVIClientProvider as BaseRTVIClientProvider } from "realtime-ai-react";

interface VoiceClientContextType {
  voiceClient: RTVIClient | null;
  isStarted: boolean;
  isLoading: boolean;
  isMicEnabled: boolean;
  isSpeakerEnabled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMicEnabled: () => void;
  toggleSpeakerEnabled: () => void;
}

const VoiceClientContext = createContext<VoiceClientContextType | null>(null);

export const VoiceClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      voiceClient.enableMic(isMicEnabled);
    }
  }, [isMicEnabled, voiceClient]);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      const botTrack = voiceClient.tracks().bot?.audio;
      if (botTrack) botTrack.enabled = isSpeakerEnabled;
    }

  }, [isSpeakerEnabled, voiceClient]);

  const toggleMicEnabled = () => {
    setIsMicEnabled(prev => !prev);
  };

  const toggleSpeakerEnabled = () => {
    setIsSpeakerEnabled(prev => !prev);
  };

  useEffect(() => {
    if (!user || voiceClient) return;

    const services = getServices(user.preferences) ?? getServices(defaultUser.preferences);
    const config = generateConfig(user) ?? generateConfig(defaultUser);

    const newVoiceClient = new RTVIClient({
      transport: new DailyTransport(),
      params: {
        baseUrl: `/api`,
        requestData: {
          services,
        },
        endpoints: {
          connect: "/connect",
          action: "/actions",
        },
        config,
      },
      callbacks: {
        onGenericMessage: (data) => console.log('generic rtvi: ', data),
        onConfig: (config) => console.log('config: ', config),
      }
    });

    const llmHelper = newVoiceClient.registerHelper(
      "llm",
      new LLMHelper({
        callbacks: {
          onLLMFunctionCall(func) {
            if (func.function_name === "disconnect_voice_client") {
              return { success: true, message: "Voice client should disconnect soon." };
            }
          },
        },
      })
    ) as LLMHelper;
  
    llmHelper.handleFunctionCall(async (fn: FunctionCallParams) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const args = fn.arguments as any;
      if (fn.functionName === "get_weather" && args.location) {
        const response = await fetch(
          `/api/weather?location=${encodeURIComponent(args.location)}`
        );
        const json = await response.json();
        return json;
      } else {
        return { error: `unknown function call: ${fn.functionName}` };
      }
    });

    setVoiceClient(newVoiceClient);

    return () => {
      if (newVoiceClient && newVoiceClient.connected) {
        newVoiceClient.disconnect();
      }
    };
  }, [user, voiceClient]);

  const disconnect = useCallback(() => {
    if (voiceClient && voiceClient.connected) voiceClient.disconnect();
    setIsStarted(false);
  }, [voiceClient]);

  const connect = useCallback(async () => {
    if (!voiceClient) return;

    try {
      setIsLoading(true);
      await voiceClient.connect();
      setIsStarted(true);
    } catch (e) {
      console.error((e as Error).message || "Unknown error occurred");
      disconnect();
    } finally {
      setIsLoading(false);
    }
  }, [disconnect, voiceClient]);


  return (
    <VoiceClientContext.Provider value={{
      voiceClient,
      isStarted,
      isLoading,
      isMicEnabled,
      isSpeakerEnabled,
      connect,
      disconnect,
      toggleMicEnabled,
      toggleSpeakerEnabled
    }}>
      <BaseRTVIClientProvider client={voiceClient!}>
        {children}
      </BaseRTVIClientProvider>
    </VoiceClientContext.Provider>
  );
};

export const useVoiceClient = () => useContext(VoiceClientContext);
