"use client";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import Image from "next/image";
import HumeVuMeter from './HumeVuMeter';
import { useHumeMessages } from '@/src/contexts/HumeMessagesContext';

export default function HumeControls({ setIsLoadingAction }: { setIsLoadingAction: (loading: boolean) => void }) {
  const { connect, readyState, isMuted, isAudioMuted, mute, unmute, muteAudio, unmuteAudio, fft, micFft } = useVoice();
  const { handleEndSession } = useHumeMessages();

  const endSession = async (shouldSave: boolean) => {
    setIsLoadingAction(true);
    await handleEndSession(shouldSave);
    setIsLoadingAction(false);
  }

  if (readyState !== VoiceReadyState.OPEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={connect}
          className="w-32 h-32 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-lg"
        >
          <div className="text-center">
            <span className="text-white" style={{ fontSize: '1.5rem' }}>Start</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-between items-center">
      <button 
        className="w-9 h-9 rounded bg-red-600 flex items-center justify-center"
        onClick={() => endSession(false)}
      >
        <Image src="/icons/cross.png" alt="End Session" width={30} height={30} />
      </button>

      <div className="flex items-center">
        <button onClick={isAudioMuted ? unmuteAudio : muteAudio} className="w-9 z-10">
          <Image 
            src={!isAudioMuted ? "/icons/feather-volume.svg" : "/icons/feather-volume-x.svg"} 
            alt={!isAudioMuted ? "Speaker On" : "Speaker Off"} 
            width={32} 
            height={32} 
          />
        </button>
        <div className="ml-[-12px]">
          <HumeVuMeter fftData={fft}
                       barColor="rgb(229, 229, 234)"
                       height={20}
                       barCount={5}
                       barWidth={4}
          />
        </div>
      </div>

      <div className="flex items-center">
        <button onClick={isMuted ? unmute : mute} className="w-9 z-10 mr-2">
          <Image 
            src={!isMuted ? "/icons/mic-on.svg" : "/icons/mic-off.svg"} 
            alt={!isMuted ? "Mic On" : "Mic Off"} 
            width={32} 
            height={32} 
          />
        </button>
        <div className="ml-[-12px]">
          <HumeVuMeter fftData={micFft}
                       barColor="rgb(0, 122, 255)"
                       height={20}
                       barCount={5}
                       barWidth={4}
          />
        </div>
      </div>

      <button
        className="w-9 h-9 rounded bg-green-600 flex items-center justify-center"
        onClick={() => endSession(true)}
      >
        <Image src="/icons/check-white.png" alt="Save" width={30} height={30} />
      </button>
    </div>
  );
}
