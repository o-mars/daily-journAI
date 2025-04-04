import React, { useEffect, useRef, useState } from "react";
import { useDailyClient } from "@/src/contexts/DailyClientContext";
import Image from "next/image";
import { RecordingService } from "@/src/services/recordingService";

const DailyRecorder: React.FC = () => {
  const { voiceClient, isStarted } = useDailyClient()!;
  const recordingServiceRef = useRef<RecordingService>(new RecordingService());
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const startRecording = () => {
    if (!isStarted || isRecording) return;

    const botTrack = voiceClient?.tracks().bot?.audio;
    const userTrack = voiceClient?.tracks().local?.audio;

    const tracks = [];
    if (botTrack) tracks.push(botTrack);
    if (userTrack) tracks.push(userTrack);
    
    recordingServiceRef.current.startRecording(tracks);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    
    try {
      const recording = await recordingServiceRef.current.stopRecording();
      if (recording) {
        // Revoke any existing blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        
        // Create new blob URL
        const audioUrl = URL.createObjectURL(recording.blob);
        blobUrlRef.current = audioUrl;
        setCurrentRecording(audioUrl);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const playRecording = async () => {
    if (!currentRecording || !audioRef.current) return;

    try {
      // Reset the audio element
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Set the source and play
      audioRef.current.src = currentRecording;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing recording:', error);
      // If playback fails, try to recreate the blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setCurrentRecording(null);
    }
  };

  const clearRecording = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setCurrentRecording(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Auto-start recording when call starts
  useEffect(() => {
    if (isStarted && !isRecording) {
      startRecording();
    }
  }, [isStarted]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 bg-surface-1 p-2 rounded-lg">
      <audio ref={audioRef} className="hidden" />
      
      {isRecording && (
        <button
          onClick={stopRecording}
          className="w-10 h-10 rounded-full bg-surface-3 hover:bg-surface-2 flex items-center justify-center"
          title="Stop Recording"
        >
          <div className="w-4 h-4 rounded bg-white" />
        </button>
      )}

      {currentRecording && (
        <>
          <button
            onClick={playRecording}
            className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
            title="Play Recording"
          >
            <Image src="/icons/bug.svg" alt="Play" width={20} height={20} />
          </button>
          <button
            onClick={clearRecording}
            className="w-10 h-10 rounded-full bg-surface-3 hover:bg-surface-2 flex items-center justify-center"
            title="Clear Recording"
          >
            <Image src="/icons/trash.png" alt="Clear" width={20} height={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default DailyRecorder;