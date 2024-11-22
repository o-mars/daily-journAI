import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { LLMFunctionCallData, RTVIError, RTVIEvent } from "realtime-ai";
import { useRTVIClient, useRTVIClientEvent, useRTVIClientTransportState, VoiceVisualizer } from "realtime-ai-react";
import { useUser } from "@/src/contexts/UserContext";

const VoiceControls: React.FC = () => {
  const { user } = useUser();
  const voiceClient = useRTVIClient();
  const vcs = useRTVIClientTransportState();

  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  const disconnectFlag = useRef<boolean>(false);

  useRTVIClientEvent(RTVIEvent.LLMFunctionCall, (data: LLMFunctionCallData) => {
    if (data.function_name === 'disconnect_voice_client') {
      console.log('disconnect_voice_client flag set in voice controls');
      disconnectFlag.current = true;
    }
  });

  useRTVIClientEvent(RTVIEvent.BotTtsStopped, () => {
    if (disconnectFlag.current) {
      console.log('bot tts stopped and disconnect flag is set so disconnecting...');
      disconnectFlag.current = false;
      waitAndDisconnect();
    }
  });

  const waitAndDisconnect = async (ms: number = 1500) => {
    await new Promise(resolve => setTimeout(resolve, ms));
    disconnect();
  }

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
      setError((e as RTVIError).message || "Unknown error occured");
      disconnect();
    } finally {
      setIsLoading(false);
    }
  }, [voiceClient, disconnect]);

  useEffect(() => {
    if (voiceClient && user && user.isNewUser && user.profile.isAnonymous && !hasConnectedOnce) {
      connect();
      setHasConnectedOnce(true);
    }
  }, [user, voiceClient, connect, hasConnectedOnce]);

  useEffect(() => {
    if(voiceClient && vcs === 'ready') {
      voiceClient.enableMic(isMicEnabled);
    }
  }, [vcs, isMicEnabled, voiceClient]);

  useEffect(() => {
    if(voiceClient && vcs === 'ready') {
      const botTrack = voiceClient.tracks().bot?.audio;
      if (botTrack) botTrack.enabled = isSpeakerEnabled;
    }
  }, [vcs, isSpeakerEnabled, voiceClient]);

  function toggleMicEnabled() {
    setIsMicEnabled(prev => !prev);
  }

  function toggleSpeakerEnabled() {
    setIsSpeakerEnabled(prev => !prev);
  }

  const spinnerStyle = {
    border: '4px solid rgba(255, 255, 255, 0.1)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    borderLeftColor: '#09f',
    animation: 'spin 1s linear infinite',
  };

  const spinnerKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={{ display: 'flex', width: '100%', paddingBottom: '8px', justifyContent: 'center' }}>
      <style>{spinnerKeyframes}</style>
      <div className="text-red-500 text-bold">{error}</div>
      {isStarted &&
        <div style={{ display: 'flex' }}>
          <button style={{ width: '28px', zIndex: 4 }}
                  onClick={() => toggleSpeakerEnabled()}>{ isSpeakerEnabled ? <Image src="/icons/feather-volume.svg" alt="Speaker On" width={28} height={28} /> : <Image src="/icons/feather-volume-x.svg" alt="Speaker Off" width={28} height={28} /> }</button>
          <div style={{ marginLeft: '-12px' }}>
            <VoiceVisualizer
              participantType="bot"
              backgroundColor="rgb(17 24 39)"
              barColor="rgb(229, 229, 234)"
              barGap={1}
              barWidth={4}
              barMaxHeight={28}
            />
          </div>
        </div>
      }
      <button style={{ width: '28px', height: '28px', marginLeft: '32px', marginRight: '32px', justifyContent: 'center' }}
              onClick={() => isStarted ? disconnect() : connect()}>
        {isLoading ? (
          <div style={spinnerStyle}></div>
        ) : (
          <Image src={isStarted ? "/icons/call-end.svg" : "/icons/feather-phone.svg"} alt="Mic" width={28} height={28} />
        )}
      </button>
      <br />
      {isStarted &&
        <div style={{ display: 'flex' }}>
          <button style={{ width: '28px' }}
                  onClick={() => toggleMicEnabled()}>{ isMicEnabled ? <Image src="/icons/mic-on.svg" alt="Mic On" width={28} height={28} /> : <Image src="/icons/mic-off.svg" alt="Mic Off" width={28} height={28} /> }</button>
            <VoiceVisualizer
              participantType="local"
              backgroundColor="rgb(17 24 39)"
              barColor="rgb(0, 122, 255)"
              barGap={1}
              barWidth={4}
              barMaxHeight={28}
            />
        </div>
      }
    </div>
  );
};

export default VoiceControls;
