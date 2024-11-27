import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RTVIClient, LLMHelper, FunctionCallParams, RTVIEvent, LLMFunctionCallData } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { getServices } from "@/src/models/user.preferences";
import { defaultUser, generateConfig } from "@/src/models/user";
import { useUser } from "@/src/contexts/UserContext";
import { RTVIClientProvider as BaseRTVIClientProvider, useRTVIClientEvent } from "realtime-ai-react";

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

const DisconnectHandler: React.FC<{ onDisconnect: () => void, voiceClient: RTVIClient | null }> = ({ onDisconnect, voiceClient }) => {
  const disconnectFlag = useRef<boolean>(false);
  const ttsInProgress = useRef<boolean>(false);
  const waitForTtsTimeout = useRef<NodeJS.Timeout>();

  useRTVIClientEvent(RTVIEvent.BotTtsStarted, () => {
    ttsInProgress.current = true;
  });

  useRTVIClientEvent(RTVIEvent.BotTtsStopped, () => {
    ttsInProgress.current = false;
    
    if (disconnectFlag.current) {
      console.log('Disconnecting post TTS.');
      disconnectFlag.current = false;
      waitAndDisconnect(1500);
    }
  });

  useRTVIClientEvent(RTVIEvent.LLMFunctionCall, (data: LLMFunctionCallData) => {
    if (data.function_name === 'disconnect_voice_client') {
      console.log('LLM: disconnect_voice_client');
      disconnectFlag.current = true;

      if (!ttsInProgress.current) {
        waitForTtsTimeout.current = setTimeout(async () => {
          if (!ttsInProgress.current) {
            console.log('No TTS, disconnecting.');
            await voiceClient?.action({
              service: "tts",
              action: "say",
              arguments: [{ name: "text", value: "Bye now!" }],
            })
            disconnectFlag.current = false;
            waitAndDisconnect(2000);
          }
        }, 500);
      }
    }
  });

  const waitAndDisconnect = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms));
    onDisconnect();
  };

  useEffect(() => {
    return () => {
      if (waitForTtsTimeout.current) {
        clearTimeout(waitForTtsTimeout.current);
      }
    };
  }, []);

  return null;
};

export const VoiceClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

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

  useEffect(() => {
    if (voiceClient && user && user.isNewUser && user.profile.isAnonymous && !hasConnectedOnce) {
      connect();
      setHasConnectedOnce(true);
    }
  }, [user, voiceClient, connect, hasConnectedOnce]);

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
    if (voiceClient && voiceClient.connected) {
      voiceClient.disconnect();
    }

    if (!user) return;

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
  }, [user]);

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
        <DisconnectHandler onDisconnect={disconnect} voiceClient={voiceClient} />
        {children}
      </BaseRTVIClientProvider>
    </VoiceClientContext.Provider>
  );
};

export const useVoiceClient = () => useContext(VoiceClientContext);
