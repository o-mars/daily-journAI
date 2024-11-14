import React, { useState, useEffect } from "react";
import { RTVIError } from "realtime-ai";
import { useRTVIClient, useRTVIClientTransportState } from "realtime-ai-react";

const VoiceControls: React.FC = () => {
  const voiceClient = useRTVIClient();
  const vcs = useRTVIClientTransportState();

  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const [isMicEnabled, setIsMicEnabled] = useState(true);

  useEffect(() => {
    if(voiceClient && vcs === 'ready') {
      voiceClient.enableMic(isMicEnabled);
    }
  }, [vcs, isMicEnabled, voiceClient]);

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

  function test() {
    setIsMicEnabled(prev => !prev);
  }

  return (
    <div>
      <div className="text-red-500 text-bold">{error}</div>
      {!isStarted && <button onClick={() => connect()}>Start</button>}
      {isStarted && <button onClick={() => disconnect()}>Finish</button>}
      <br />
      {isStarted &&
        <>
          <button onClick={() => test()}>Mic: { isMicEnabled ? 'Enabled' : 'Disabled' }</button>
        </>
      }
    </div>
  );
};

export default VoiceControls;
