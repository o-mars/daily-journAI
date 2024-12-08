"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { LLMHelper, RTVIClient, RTVIEvent } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { getServices } from "@/src/models/user.preferences";
import { defaultUser, generateConfigWithBotType } from "@/src/models/user";
import { useUser } from "@/src/contexts/UserContext";
import { RTVIClientProvider as BaseRTVIClientProvider, useRTVIClientEvent } from "realtime-ai-react";
import { LLM_GOODBYE_PROMPTS } from '@/src/models/prompts';
import { useHeader } from '@/src/contexts/HeaderContext';

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
  resetIdleTimer: () => void;
}

const VoiceClientContext = createContext<VoiceClientContextType | null>(null);

const IDLE_TIMEOUT = 30000;
const TTS_DISCONNECT_TIMEOUT = 3000;

const DisconnectHandler: React.FC<{ 
  onDisconnect: () => void,
  onResetIdle: (callback: () => void) => void 
}> = ({ onDisconnect, onResetIdle }) => {
  const isBotSpeaking = useRef(false);
  const isUserSpeaking = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const disconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const clearIdleTimer = () => {
    if (idleTimer.current) {
      console.debug('Clearing idle timer');
      clearTimeout(idleTimer.current);
    }
  };

  const startIdleTimer = () => {
    clearIdleTimer();

    if (!isBotSpeaking.current && !isUserSpeaking.current) {
      console.debug(`Starting idle timer for ${IDLE_TIMEOUT}ms`);
      idleTimer.current = setTimeout(() => {
        console.debug('Idle timeout reached, disconnecting.');
        onDisconnect();
      }, IDLE_TIMEOUT);
    }
  };

  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, () => {
    isUserSpeaking.current = true;
    if (disconnectTimer.current) {
      clearInterval(disconnectTimer.current);
      disconnectTimer.current = null;
      console.debug('Cancelling disconnect as user continued speaking');
    }
    clearIdleTimer();
  });

  useRTVIClientEvent(RTVIEvent.UserTranscript, () => {
    isUserSpeaking.current = true;
    clearIdleTimer();
  });

  useRTVIClientEvent(RTVIEvent.UserStoppedSpeaking, () => {
    isUserSpeaking.current = false;
    startIdleTimer();
  });

  useRTVIClientEvent(RTVIEvent.BotTtsStarted, () => {
    isBotSpeaking.current = true;
    clearIdleTimer();
  });

  useRTVIClientEvent(RTVIEvent.BotTtsStopped, () => {
    isBotSpeaking.current = false;
    startIdleTimer();
  });

  const checkForDisconnect = (message: string) => {
    if (LLM_GOODBYE_PROMPTS.some(prompt => message.includes(prompt))) {
      console.debug('Goodbye prompt detected, waiting to disconnect.');

      if (disconnectTimer.current) return;

      disconnectTimer.current = setInterval(() => {
        if (!isBotSpeaking.current && !isUserSpeaking.current) {
          console.debug('Disconnecting after silence.');
          onDisconnect();
          clearInterval(disconnectTimer.current!);
          disconnectTimer.current = null;
        }
      }, TTS_DISCONNECT_TIMEOUT);
    }
  };

  useRTVIClientEvent(RTVIEvent.BotLlmText, (message) => {
    checkForDisconnect(message.text);
  });
  useRTVIClientEvent(RTVIEvent.BotTranscript, (message) => {
    checkForDisconnect(message.text);
  });
  useRTVIClientEvent(RTVIEvent.BotTtsText, (message) => {
    checkForDisconnect(message.text);
  });

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (disconnectTimer.current) clearInterval(disconnectTimer.current);
    };
  }, []);

  useEffect(() => {
    onResetIdle(() => {
      startIdleTimer();
    });
  }, [onResetIdle]);

  return null;
};

export const VoiceClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { branding } = useHeader();
  const { user } = useUser();
  const [voiceClient, setVoiceClient] = useState<RTVIClient | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);
  const resetIdleTimerCallback = useRef<(() => void) | null>(null);

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

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      voiceClient.enableMic(isMicEnabled);
    }
  }, [isMicEnabled, voiceClient]);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      const botTrack = voiceClient.tracks().bot?.audio;
      if (botTrack) botTrack.enabled = isSpeakerEnabled;
      voiceClient.enableMic(isMicEnabled);
    }
  }, [voiceClient?.connected]);

  const toggleMicEnabled = () => {
    setIsMicEnabled(prev => !prev);
  };

  const toggleSpeakerEnabled = () => {
    setIsSpeakerEnabled(prev => !prev);
  };

  const resetIdleTimer = useCallback(() => {
    resetIdleTimerCallback.current?.();
  }, []);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      voiceClient.disconnect();
    }

    if (!user) return;

    const services = getServices(user.preferences) ?? getServices(defaultUser.preferences);
    const config = generateConfigWithBotType(user, branding.botType) ?? generateConfigWithBotType(defaultUser, branding.botType);

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

    newVoiceClient.registerHelper(
      "llm",
      new LLMHelper({
        callbacks: {},
      })
    ) as LLMHelper;

    setVoiceClient(newVoiceClient);

    return () => {
      if (newVoiceClient && newVoiceClient.connected) {
        newVoiceClient.disconnect();
      }
    };
  }, [user, branding.botType]);

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
      toggleSpeakerEnabled,
      resetIdleTimer
    }}>
      <BaseRTVIClientProvider client={voiceClient!}>
        <DisconnectHandler 
          onDisconnect={disconnect}
          onResetIdle={callback => resetIdleTimerCallback.current = callback}
        />
        {children}
      </BaseRTVIClientProvider>
    </VoiceClientContext.Provider>
  );
};

export const useVoiceClient = () => useContext(VoiceClientContext);
