import React from "react";
import Image from "next/image";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import TextMessageInput from "./TextMessageInput";
import { VoiceVisualizer } from "realtime-ai-react";
import { useJournalEntryContext } from "@/src/contexts/JournalEntryContext";
import { useUser } from "@/src/contexts/UserContext";

const VoiceControls: React.FC = () => {
  const { isInitialized } = useUser();

  const {
    isStarted,
    isLoading,
    isMicEnabled,
    isSpeakerEnabled,
    connect,
    disconnect,
    toggleMicEnabled,
    toggleSpeakerEnabled,
  } = useVoiceClient()!;

  const { toggleTextInputVisibility } = useJournalEntryContext();

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
    <>
      {!isMicEnabled && <TextMessageInput />}
      <div style={{ display: 'flex', width: '100%', paddingBottom: '8px', justifyContent: 'center' }}>
        <style>{spinnerKeyframes}</style>
        {isStarted &&
          <div style={{ display: 'flex' }}>
            <button style={{ width: '28px', zIndex: 4 }}
                    onClick={toggleSpeakerEnabled}>
              {isSpeakerEnabled ? <Image src="/icons/feather-volume.svg" alt="Speaker On" width={28} height={28} /> : <Image src="/icons/feather-volume-x.svg" alt="Speaker Off" width={28} height={28} />}
            </button>
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
                onClick={() => isStarted ? disconnect() : connect()}
                disabled={!isInitialized}>
          {isLoading || !isInitialized ? (
            <div style={spinnerStyle}></div>
          ) : (
            <Image src={isStarted ? "/icons/call-end.svg" : "/icons/feather-phone.svg"} alt="Mic" width={28} height={28} />
          )}
        </button>
        {isStarted &&
          <div style={{ display: 'flex', textAlign: 'right' }}>
            <button style={{ width: '28px' }}
                    onClick={() => {
                      toggleMicEnabled();
                      toggleTextInputVisibility();
                    }}>
              {isMicEnabled ? <Image src="/icons/mic-on.svg" alt="Mic On" width={28} height={28} /> : <Image src="/icons/mic-off.svg" alt="Mic Off" width={28} height={28} />}
            </button>
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
    </>
  );
};

export default VoiceControls;
