"use client";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import Image from "next/image";
import { saveJournalEntry, closePrivateJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";
import { useHeader } from "@/src/contexts/HeaderContext";
import { trackEvent } from "@/src/services/metricsSerivce";
import { defaultJournalEntryMetadata } from "@/src/models/journal.entry";
import HumeVuMeter from './HumeVuMeter';
import { ClientProvider } from "@/src/models/user.preferences";
import { useHumeMessages } from '@/src/contexts/HumeMessagesContext';

export default function HumeControls({ setIsLoadingAction }: { setIsLoadingAction: (loading: boolean) => void }) {
  const { connect, disconnect, readyState, isMuted, isAudioMuted, mute, unmute, muteAudio, unmuteAudio, fft, micFft, chatMetadata } = useVoice();
  const { user, syncLocalUser } = useUser();
  const { branding, navigateToView } = useHeader();
  const { allMessages } = useHumeMessages();

  const handleEndSession = async (shouldSave: boolean) => {
    disconnect();
    const didUserInteract = allMessages.some(message => message.from === 'user');
    if (didUserInteract) {
      setIsLoadingAction(true);
      try {
        const messagesToSave = [...allMessages];
        const durationInSeconds = allMessages.length > 0 ?
          Math.floor((new Date().getTime() - allMessages[0].sentAt.getTime()) / 1000) :
          0;
        const assistantEntries = allMessages.filter(message => message.from === 'assistant');
        const userEntries = allMessages.filter(message => message.from === 'user');

        const finalMetadata = {
          ...defaultJournalEntryMetadata,
          userId: user!.userId,
          email: user!.profile?.email ?? '',
          assistantEntries: assistantEntries.length,
          userEntries: userEntries.length,
          duration: durationInSeconds,
          type: branding.botType,
          inputLength: userEntries.reduce((acc, message) => acc + message.text.length, 0),
          outputLength: assistantEntries.reduce((acc, message) => acc + message.text.length, 0),
          provider: 'hume' as ClientProvider,
          ...(chatMetadata?.chatId && { chatId: chatMetadata.chatId }),
          ...(chatMetadata?.chatGroupId && { chatGroupId: chatMetadata.chatGroupId })
        };

        if (shouldSave) {
          const response = await saveJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-saved", { ...finalMetadata, journalId: response.id });
          await syncLocalUser();
          navigateToView('journals/:journalEntryId', { journalEntryId: response.id });
        } else {
          await closePrivateJournalEntry(messagesToSave, finalMetadata);
          trackEvent("session", "session-discarded", { ...finalMetadata });
        }
        trackEvent("session", "session-ended", { ...finalMetadata });
      } finally {
        setIsLoadingAction(false);
      }
    }
  };

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
        onClick={() => handleEndSession(false)}
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
          <HumeVuMeter fftData={fft} barColor="rgb(229, 229, 234)" />
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
          <HumeVuMeter fftData={micFft} barColor="rgb(0, 122, 255)" />
        </div>
      </div>

      <button
        className="w-9 h-9 rounded bg-green-600 flex items-center justify-center"
        onClick={() => handleEndSession(true)}
      >
        <Image src="/icons/check-white.png" alt="Save" width={30} height={30} />
      </button>
    </div>
  );
}
