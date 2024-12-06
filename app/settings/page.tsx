"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import VoiceControls from "../../src/components/VoiceControls";
import StatusIndicator, { StatusType } from '@/src/components/StatusIndicator';

import { useUser } from "@/src/contexts/UserContext";
import Header from "@/src/components/Header";
import { defaultUser } from "@/src/models/user";
import { COUNTRY_ICONS, LANGUAGES, VOICES } from "@/src/models/constants";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import { JournalEntryProvider } from "@/src/contexts/JournalEntryContext";
import { useHeader } from "@/src/contexts/HeaderContext";

export default function Settings() {
  const { branding } = useHeader();
  const { user, updateUser } = useUser();
  const { isLoading, isStarted } = useVoiceClient()!;

  const isDisabled = isLoading || isStarted;

  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: null,
    message: ''
  });
  const [localUser, setLocalUser] = useState(defaultUser);

  const [filteredVoices, setFilteredVoices] = useState(VOICES);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setLocalUser(prevUser => ({
        ...prevUser,
        ...user
      }));
    }
  }, [user]);

  useEffect(() => {
    const voices = VOICES.filter(voice => voice.languageId === localUser.preferences.botPreferences[branding.botType].languageId);
    setFilteredVoices(voices);
  }, [localUser.preferences.botPreferences, branding.botType]);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const newLocalUser = { ...localUser };
    
    if (id === 'name' || id === 'city') {
      newLocalUser.profile[id] = value;
    } else if (id === 'voiceId' || id === 'languageId') {
      newLocalUser.preferences.botPreferences[branding.botType][id] = value;

      if (id === 'voiceId' && value) {
        const audio = new Audio(`/audio/${value}.wav`);
        try {
          await audio.play();
        } catch (error) {
          console.error('Failed to play audio sample:', error);
        }
      }
    } else if (id === 'vadStopSecs') {
      const numValue = parseFloat(value);
      newLocalUser.preferences.botPreferences[branding.botType][id] = numValue;
    }
    
    setLocalUser(newLocalUser);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (isSaving) return;
      setIsSaving(true);
      try {
        if (!user) {
          setStatus({ type: 'error', message: 'User not logged in' });
          return;
        }

        setStatus({ type: 'loading', message: 'Saving...' });
        
        const clonedUser = { 
          ...user,
          profile: { ...newLocalUser.profile },
          preferences: { ...newLocalUser.preferences }
        };
        
        await updateUser(clonedUser);
        setStatus({ type: 'success', message: 'Saved successfully' });
      } catch (error) {
        console.error(error);
        setStatus({ type: 'error', message: 'Failed to save changes' });
        setLocalUser({
          ...defaultUser,
          ...user
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [localUser, isSaving, user, updateUser, branding.botType]);

  return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />

        <JournalEntryProvider>
          <main className="flex-grow overflow-auto pt-8 p-4">
            <div className="max-w-2xl mx-auto space-y-6 text-white">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="block mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={localUser.profile.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your name"
                    disabled={isDisabled}
                  />
                </div>

                {/* <div className="form-group">
                  <label htmlFor="city" className="block mb-2">City</label>
                  <input
                    type="text"
                    id="city"
                    value={localUser.profile.city || ''}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your city"
                    disabled={isDisabled}
                  />
                </div> */}

                <div className="form-group">
                  <label htmlFor="voiceId" className="block mb-2">Voice</label>
                  <select
                    id="voiceId"
                    value={localUser.preferences.botPreferences[branding.botType].voiceId}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                  >
                    {filteredVoices.map(voice => (
                      <option key={voice.id} value={voice.id}>
                        {`${COUNTRY_ICONS[voice.country] || ''} ${voice.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="languageId" className="block mb-2">Language</label>
                  <select
                    id="languageId"
                    value={localUser.preferences.botPreferences[branding.botType].languageId}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                  >
                    {Object.values(LANGUAGES).map(language => (
                      <option key={language.id} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="vadStopSecs" className="block mb-2">
                    Delay Before Response: <span className="text-gray-400">{localUser.preferences.botPreferences[branding.botType].vadStopSecs}s</span>
                  </label>
                  <input
                    type="range"
                    id="vadStopSecs"
                    min={0.2}
                    max={2}
                    step={0.1}
                    value={localUser.preferences.botPreferences[branding.botType].vadStopSecs}
                    onChange={handleChange}
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <StatusIndicator
                    status={status.type}
                    message={status.message}
                    duration={1200}
                    onStatusClear={() => setStatus({ type: null, message: '' })}
                  />
                </div>
              </div>
            </div>
          </main>

          <footer className="bg-gray-900 sticky bottom-0 z-10 p-2">
            <VoiceControls />
          </footer>
        </JournalEntryProvider>
      </div>
  );
}
