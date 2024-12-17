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
    isLoading: isVoiceClientLoading,
    isMicEnabled,
    isSpeakerEnabled,
    connect,
    disconnect,
    toggleMicEnabled,
    toggleSpeakerEnabled,
    setShouldSaveOnDisconnect,
  } = useVoiceClient()!;

  const handleDisconnect = (shouldSave: boolean) => {
    setShouldSaveOnDisconnect(shouldSave);
    disconnect();
  };

  const { toggleTextInputVisibility, isLoading: isJournalEntryLoading } = useJournalEntryContext();

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

  if (isVoiceClientLoading || isJournalEntryLoading || !isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
        <style>{spinnerKeyframes}</style>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
        <button 
          style={{ width: '28px', height: '28px' }}
          onClick={connect}
        >
          <Image src="/icons/feather-phone.svg" alt="Start Call" width={28} height={28} />
        </button>
      </div>
    );
  }

  return (
    <>
      {!isMicEnabled && <TextMessageInput />}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
        <style>{spinnerKeyframes}</style>

        <button 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            backgroundColor: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => handleDisconnect(false)}
        >
          <Image src="/icons/cross.png" alt="Discard" width={30} height={30} />
        </button>

        <div style={{ display: 'flex' }}>
          <button style={{ width: '36px', zIndex: 4 }} onClick={toggleSpeakerEnabled}>
            {isSpeakerEnabled ? <Image src="/icons/feather-volume.svg" alt="Speaker On" width={32} height={32} /> : <Image src="/icons/feather-volume-x.svg" alt="Speaker Off" width={32} height={32} />}
          </button>
          <div style={{ marginLeft: '-12px' }}>
            <VoiceVisualizer
              participantType="bot"
              backgroundColor="rgb(17 24 39)"
              barColor="rgb(229, 229, 234)"
              barGap={1}
              barWidth={4}
              barMaxHeight={36}
            />
          </div>
        </div>

        <div style={{ display: 'flex', textAlign: 'right' }}>
          <button style={{ width: '36px' }}
                  onClick={() => {
                    toggleMicEnabled();
                    toggleTextInputVisibility();
                  }}>
            {isMicEnabled ? <Image src="/icons/mic-on.svg" alt="Mic On" width={32} height={32} /> : <Image src="/icons/mic-off.svg" alt="Mic Off" width={32} height={32} />}
          </button>
          <VoiceVisualizer
            participantType="local"
            backgroundColor="rgb(17 24 39)"
            barColor="rgb(0, 122, 255)"
            barGap={1}
            barWidth={4}
            barMaxHeight={36}
          />
        </div>

        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            backgroundColor: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => handleDisconnect(true)}
        >
          <Image src="/icons/check-white.png" alt="Save" width={30} height={30} />
        </button>
      </div>
    </>
  );
};

export default VoiceControls;
