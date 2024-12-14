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
import { trackEvent } from '@/src/services/metricsSerivce';

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
  setShouldSaveOnDisconnect: (shouldSave: boolean) => void;
  shouldSaveRef: React.MutableRefObject<boolean>;
}

const VoiceClientContext = createContext<VoiceClientContextType | null>(null);

const IDLE_TIMEOUT = 60000;
const TTS_DISCONNECT_TIMEOUT = 3000;

const DisconnectHandler: React.FC<{ 
  onDisconnect: () => void,
  onResetIdle: (callback: () => void) => void,
}> = ({ onDisconnect, onResetIdle }) => {
  const isBotSpeaking = useRef(false);
  const isUserSpeaking = useRef(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const disconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      console.debug('Clearing idle timer');
      clearTimeout(idleTimer.current);
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();

    if (!isBotSpeaking.current && !isUserSpeaking.current) {
      console.debug(`Starting idle timer for ${IDLE_TIMEOUT}ms`);
      idleTimer.current = setTimeout(() => {
        console.debug('Idle timeout reached, disconnecting.');
        onDisconnect();
      }, IDLE_TIMEOUT);
    }
  }, [clearIdleTimer, onDisconnect]);

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

  const checkForDisconnect = useCallback((message: string) => {
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
  }, [onDisconnect]);

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
  }, [onResetIdle, startIdleTimer]);

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
  const resetIdleTimerCallback = useRef<(() => void) | null>(null);
  const shouldSaveOnDisconnectRef = useRef<boolean>(true);

  const disconnect = useCallback(async () => {
    if (voiceClient && voiceClient.connected) {
      setIsLoading(true);
      await voiceClient.disconnect();
      setIsLoading(false);
    }
    setIsStarted(false);
  }, [voiceClient]);

  const connect = useCallback(async () => {
    if (!voiceClient) return;

    try {
      setIsLoading(true);
      await voiceClient.connect();
      trackEvent("session", "session-started", { userId: user?.userId, email: user?.profile?.email ?? '' });
      setIsStarted(true);
    } catch (e) {
      console.error((e as Error).message || "Unknown error occurred");
      trackEvent("session", "session-error", { userId: user?.userId });
      disconnect();
    } finally {
      setIsLoading(false);
    }
  }, [disconnect, voiceClient, user?.userId]);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      voiceClient.enableMic(isMicEnabled);
      trackEvent("session", isMicEnabled ? "mic-enabled" : "mic-disabled", { userId: user?.userId });
    }
  }, [isMicEnabled, voiceClient, user?.userId]);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      const botTrack = voiceClient.tracks().bot?.audio;
      if (botTrack) {
        botTrack.enabled = isSpeakerEnabled;
        trackEvent("session", isSpeakerEnabled ? "speaker-enabled" : "speaker-disabled", { userId: user?.userId });
      }
    }

  }, [isSpeakerEnabled, voiceClient, user?.userId]);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      voiceClient.enableMic(isMicEnabled);
    }
  }, [isMicEnabled, voiceClient, user?.userId]);

  useEffect(() => {
    if (voiceClient && voiceClient.connected) {
      const botTrack = voiceClient.tracks().bot?.audio;
      if (botTrack) botTrack.enabled = isSpeakerEnabled;
      voiceClient.enableMic(isMicEnabled);
    }
  }, [voiceClient?.connected, isMicEnabled, isSpeakerEnabled]);

  const toggleMicEnabled = useCallback(() => {
    setIsMicEnabled(prev => !prev);
  }, []);

  const toggleSpeakerEnabled = useCallback(() => {
    setIsSpeakerEnabled(prev => !prev);
  }, []);

  const resetIdleTimer = useCallback(() => {
    resetIdleTimerCallback.current?.();
  }, []);

  const setShouldSaveOnDisconnect = useCallback((shouldSave: boolean) => {
    shouldSaveOnDisconnectRef.current = shouldSave;
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
      resetIdleTimer,
      setShouldSaveOnDisconnect,
      shouldSaveRef: shouldSaveOnDisconnectRef
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
