import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { RTVIError } from "realtime-ai";
import { useRTVIClient, useRTVIClientTransportState, VoiceVisualizer } from "realtime-ai-react";
import { useUser } from "@/src/contexts/UserContext";

const VoiceControls: React.FC = () => {
  const { user } = useUser();
  const voiceClient = useRTVIClient();
  const vcs = useRTVIClientTransportState();

  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

  const disconnect = useCallback(() => {
    if (voiceClient && voiceClient.connected) voiceClient.disconnect();
    setIsStarted(false);
  }, [voiceClient]);

  const connect = useCallback(async () => {
    if (!voiceClient) return;

    try {
      setIsStarted(true);
      await voiceClient.connect();
    } catch (e) {
      setError((e as RTVIError).message || "Unknown error occured");
      disconnect();
    }
  }, [voiceClient, disconnect]);

  useEffect(() => {
    if(voiceClient && user && user.isNewUser && user.profile.isAnonymous) {
      connect();
    }
  }, [user, voiceClient, connect]);

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

  return (
    <div style={{ display: 'flex', width: '50%', justifyContent: 'space-around' }}>
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
      <button style={{ width: '28px', height: '28px' }}
              onClick={() => isStarted ? disconnect() : connect()}>
        <Image src={isStarted ? "/icons/call-end.svg" : "/icons/feather-phone.svg"} alt="Mic" width={28} height={28} />
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
