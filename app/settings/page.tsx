"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import VoiceControls from "../../src/components/VoiceControls";
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';

import { useUser } from "@/src/contexts/UserContext";
import Header from "@/src/components/Header";
import { defaultUser } from "@/src/models/user";
import { CHECK_EMAIL_MESSAGE, COUNTRY_ICONS, LANGUAGES, VOICES } from "@/src/models/constants";
import { useVoiceClient } from "@/src/contexts/VoiceClientContext";
import { JournalEntryProvider } from "@/src/contexts/JournalEntryContext";
import { useHeader } from "@/src/contexts/HeaderContext";
import InputWithButton from "@/src/components/InputWithButton";
import { isValidEmail, sendMagicLink } from "@/src/services/authService";
import Modal from '@/src/components/Modal';
import PhoneAuth from "@/src/components/PhoneAuth";

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

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [emailToConnect, setEmailToConnect] = useState<string>('');

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

  const handleSendMagicLink = useCallback(async () => {
    if (!isValidEmail(emailToConnect)) {
      statusRef.current?.pushMessage({ type: 'error', text: "Please enter a valid email address" });
      return;
    }

    if (!user) {
      statusRef.current?.pushMessage({ type: 'error', text: "User not logged in" });
      return;
    }

    await sendMagicLink(emailToConnect, user.userId);
    statusRef.current?.pushMessage({ type: 'info', text: CHECK_EMAIL_MESSAGE });
  }, [emailToConnect, user, statusRef]);

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
                  <label htmlFor="email" className="block mb-2">Email</label>
                  <InputWithButton
                    value={localUser.profile.email || emailToConnect}
                    onChange={(newEmail) => {
                      setEmailToConnect(newEmail);
                    }}
                    readOnly={!!localUser.profile.email && localUser.profile.email !== ''}
                    onButtonClick={handleSendMagicLink}
                    placeholder="Enter your email address"
                    buttonLabel="Connect"
                    shouldShowButton={!isValidEmail(localUser.profile.email)}
                    disabled={!isValidEmail(emailToConnect)}
                  />
                </div>

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
                  <label htmlFor="phone" className="block mb-2">Phone Number</label>
                  <InputWithButton
                    value={localUser.profile.phone || ''}
                    onChange={() => {}}
                    readOnly={true}
                    onButtonClick={() => setShowPhoneModal(true)}
                    placeholder="Enter your phone number"
                    buttonLabel="Connect"
                    shouldShowButton={!localUser.profile.phone}
                  />
                  <Modal
                    isOpen={showPhoneModal}
                    onClose={() => setShowPhoneModal(false)}
                    title="Connect Phone Number"
                  >
                    <PhoneAuth
                      testMode={true}
                      mode="link"
                      onSuccess={() => {
                        setShowPhoneModal(false);
                      }} 
                    />
                  </Modal>
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
