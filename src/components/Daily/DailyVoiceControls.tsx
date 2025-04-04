import React from "react";
import Image from "next/image";
import { useDailyClient } from "@/src/contexts/DailyClientContext";
import DailyTextInput from "./DailyTextInput";
import { VoiceVisualizer } from "realtime-ai-react";
import { useDailySessionContext } from "@/src/contexts/DailySessionContext";
import { useUser } from "@/src/contexts/UserContext";
import { useState, useEffect } from 'react';

function useThemeColors() {
  const [colors, setColors] = useState({
    background: '#f3f4f6',
    assistantBar: '#f3f4f6',
  });

  useEffect(() => {
    function updateColors() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setColors({
        background: isDark ? '#121212' : '#f3f4f6',
        assistantBar: isDark ? '#ededed' : '#171717',
      });
    }

    // Initial update
    updateColors();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

const DailyVoiceControls: React.FC = () => {
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
  } = useDailyClient()!;

  const handleDisconnect = (shouldSave: boolean) => {
    setShouldSaveOnDisconnect(shouldSave);
    disconnect();
  };

  const { toggleTextInputVisibility, isLoading: isJournalEntryLoading } = useDailySessionContext();

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

  const { background, assistantBar } = useThemeColors();

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
      <button 
        onClick={connect}
        className="w-32 h-32 rounded-full bg-accent-primary hover:bg-accent-primary-hover transition-colors duration-200 flex items-center justify-center shadow-lg"
      >
        <div className="text-center">
          <span className="text-primary" style={{ fontSize: '1.5rem' }}>Start</span>
        </div>
      </button>
    );
  }

  return (
    <>
      {!isMicEnabled && <DailyTextInput />}
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
              backgroundColor={background}
              barColor={assistantBar}
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
            backgroundColor={background}
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

export default DailyVoiceControls;