"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import VoiceControls from "../../src/components/VoiceControls";
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';

import { useUser } from "@/src/contexts/UserContext";
import Header from "@/src/components/Header";
import { defaultUser } from "@/src/models/user";
import { COUNTRY_ICONS, LANGUAGES, VOICES } from "@/src/models/constants";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import { JournalEntryProvider } from "@/src/contexts/JournalEntryContext";
import { useHeader } from "@/src/contexts/HeaderContext";

export default function Settings() {
  const { branding } = useHeader();
  const { user, updateUser, isInitialized } = useUser();
  const { isLoading, isStarted } = useVoiceClient()!;

  const isDisabled = isLoading || isStarted || !isInitialized;

  const statusRef = useRef<StatusIndicatorHandle>(null);

  const [localUser, setLocalUser] = useState(defaultUser);

  const [filteredVoices, setFilteredVoices] = useState(VOICES);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isSaving, setIsSaving] = useState(false);

  // const [phoneNumber, setPhoneNumber] = useState('');

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

  // const isValidPhoneNumber = (phoneNumber: string) => {
  //   const phoneRegex = /^\+?\d{1,3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{4}$/; // Regex for phone number format
  //   return phoneRegex.test(phoneNumber.trim()) || phoneNumber.trim() === "";
  // };

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const newLocalUser = { ...localUser };
    
    if (id === 'name' || id === 'city') {
      newLocalUser.profile[id] = value;
    } else if (id === 'phone') {
      // const formattedValue = value.replace(/[^+\d\s-]/g, '');
      // setPhoneNumber(formattedValue);
      // const isValid = isValidPhoneNumber(formattedValue.trim());
      // console.log('formattedValue', formattedValue, isValid);
      // if (isValid && formattedValue.trim() !== newLocalUser.profile.phone) {
      //   newLocalUser.profile.phone = formattedValue.trim();
      //   setPhoneNumber("");
      // }
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
          statusRef.current?.pushMessage({ type: 'error', text: 'User not logged in' });
          return;
        }

        statusRef.current?.pushMessage({ type: 'loading', text: 'Saving...' });
        
        const clonedUser = { 
          ...user,
          profile: { ...newLocalUser.profile },
          preferences: { ...newLocalUser.preferences }
        };
        
        await updateUser(clonedUser);
        statusRef.current?.pushMessage({ type: 'success', text: 'Saved successfully' });
      } catch (error) {
        console.error(error);
        statusRef.current?.pushMessage({ type: 'error', text: 'Failed to save changes' });
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

                {/* <div className="form-group">
                  <label htmlFor="name" className="block mb-2">Display Name</label>
                  <input
                    type="text"
                    id="name"
                    value={localUser.profile.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your name"
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


                {/* <div className="form-group">
                  <label htmlFor="phone" className="block mb-2">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    value={phoneNumber}
                    onChange={handleChange}
                    className={`w-full p-2 rounded bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${phoneNumber === '' ? '' : 'border-red-500'}`}
                    placeholder={localUser.profile.phone || 'Enter your phone number'}
                    disabled={isDisabled}
                  />
                </div>
 */}
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
                    min={0.8}
                    max={2.4}
                    step={0.1}
                    value={localUser.preferences.botPreferences[branding.botType].vadStopSecs}
                    onChange={handleChange}
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <StatusIndicator
                    ref={statusRef}
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
