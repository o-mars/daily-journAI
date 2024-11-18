import React, { useState, useEffect } from "react";
import { RTVIError } from "realtime-ai";
import { useRTVIClient, useRTVIClientTransportState, VoiceVisualizer } from "realtime-ai-react";

const VoiceControls: React.FC = () => {
  const voiceClient = useRTVIClient();
  const vcs = useRTVIClientTransportState();

  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);

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

  async function connect() {
    if (!voiceClient) return;

    try {
      await voiceClient.connect();
      setIsStarted(true);
    } catch (e) {
      setError((e as RTVIError).message || "Unknown error occured");
      disconnect();
    }
  }

  function disconnect() {
    if (voiceClient) voiceClient.disconnect();
    setIsStarted(false);
  }

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
          <button style={{ width: '28px' }}
                  onClick={() => toggleMicEnabled()}>{ isMicEnabled ? <img src="/icons/mic-on.svg" alt="Mic On" /> : <img src="/icons/mic-off.svg" alt="Mic Off" /> }</button>
            <VoiceVisualizer
              participantType="local"
              backgroundColor="black"
              barColor="cyan"
              barGap={1}
              barWidth={4}
              barMaxHeight={28}
            />
        </div>
      }
      <button style={{ width: '28px', height: '28px' }}
              onClick={() => isStarted ? disconnect() : connect()}>
        <img src={isStarted ? "/icons/call-end.svg" : "/icons/feather-phone.svg"} alt="Mic" />
      </button>
      <br />
      {isStarted &&
        <div style={{ display: 'flex' }}>
          <button style={{ width: '28px', zIndex: 4 }}
                  onClick={() => toggleSpeakerEnabled()}>{ isSpeakerEnabled ? <img src="/icons/feather-volume.svg" alt="Speaker On" /> : <img src="/icons/feather-volume-x.svg" alt="Speaker Off" /> }</button>
          <div style={{ marginLeft: '-12px' }}>
            <VoiceVisualizer
              participantType="bot"
              backgroundColor="black"
              barColor="magenta"
              barGap={1}
              barWidth={4}
              barMaxHeight={28}
            />
          </div>
        </div>
      }
    </div>
  );
};

export default VoiceControls;
