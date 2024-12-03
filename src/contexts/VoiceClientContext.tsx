import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RTVIClient, RTVIEvent } from "realtime-ai";
import { DailyTransport } from "realtime-ai-daily";
import { getServices } from "@/src/models/user.preferences";
import { defaultUser, generateConfigWithBotType } from "@/src/models/user";
import { useUser } from "@/src/contexts/UserContext";
import { RTVIClientProvider as BaseRTVIClientProvider, useRTVIClientEvent } from "realtime-ai-react";
import { DEFAULT_BOT_TYPE } from '@/src/models/constants';

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

const IDLE_TIMEOUT = 12500;

const DisconnectHandler: React.FC<{ onDisconnect: () => void }> = ({ onDisconnect }) => {
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      console.debug('Clearing idle timer');
      clearTimeout(idleTimer.current);
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();

    if (!isBotSpeaking && !isUserSpeaking) {
      console.debug(`Starting idle timer for ${IDLE_TIMEOUT}ms`);
      idleTimer.current = setTimeout(() => {
        console.debug('Idle timeout reached, disconnecting.');
        onDisconnect();
      }, IDLE_TIMEOUT);
    }
  }, [isBotSpeaking, isUserSpeaking, onDisconnect, clearIdleTimer]);

  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, () => {
    setIsUserSpeaking(true);
  });

  useRTVIClientEvent(RTVIEvent.UserTranscript, () => {
    setIsUserSpeaking(true);
  });

  useRTVIClientEvent(RTVIEvent.UserStoppedSpeaking, () => {
    setIsUserSpeaking(false);
  });

  useRTVIClientEvent(RTVIEvent.BotTtsStarted, () => {
    setIsBotSpeaking(true);
  });

  useRTVIClientEvent(RTVIEvent.BotTtsStopped, () => {
    setIsBotSpeaking(false);
  });

  useEffect(() => {
    return () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isBotSpeaking || isUserSpeaking) {
      clearIdleTimer();
    } else if (!isBotSpeaking && !isUserSpeaking) {
      startIdleTimer();
    }

    return () => {};
  }, [isBotSpeaking, isUserSpeaking, startIdleTimer, clearIdleTimer]);

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
    const config = generateConfigWithBotType(user, DEFAULT_BOT_TYPE) ?? generateConfigWithBotType(defaultUser, DEFAULT_BOT_TYPE);

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
        <DisconnectHandler onDisconnect={disconnect} />
        {children}
      </BaseRTVIClientProvider>
    </VoiceClientContext.Provider>
  );
};

export const useVoiceClient = () => useContext(VoiceClientContext);
