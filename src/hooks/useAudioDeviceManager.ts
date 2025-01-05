import { useEffect } from 'react';

export function useAudioDeviceManager() {
  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) {
      console.warn('MediaDevices API not supported');
      return;
    }

    const handleDeviceChange = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        const selectedOutput = audioOutputs.find(device => device.deviceId === 'default');
        
        const audioElements = document.getElementsByTagName('audio');
        for (const audioElement of audioElements) {
          if ('setSinkId' in audioElement) {
            try {
              await audioElement.setSinkId(selectedOutput?.deviceId || 'default');
            } catch (err) {
              console.error('Error setting audio output device:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error handling device change:', err);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    handleDeviceChange(); // Initial setup

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);
} 