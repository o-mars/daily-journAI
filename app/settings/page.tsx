"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';

import { useUser } from "@/src/contexts/UserContext";
import Header from "@/src/components/Header";
import { defaultUser, User } from "@/src/models/user";
import { CHECK_EMAIL_MESSAGE, LANGUAGES, COUNTRY_ICONS, VOICES } from "@/src/models/constants";
import InputWithButton from "@/src/components/InputWithButton";
import { isValidEmail, sendMagicLink } from "@/src/services/authService";
import ConfirmationModal from "@/src/components/ConfirmationModal";
import { useRouter } from 'next/navigation';
import { deleteAllJournalEntries, deleteUser } from "@/src/client/firebase.service.client";
import { signOut } from "@/src/services/authService";
import { trackEvent } from "@/src/services/metricsSerivce";
import { ConfigCategory } from "@/src/models/categories.config";
import DailyVoiceControls from "@/src/components/Daily/DailyVoiceControls";
import { useHeader } from "@/src/contexts/HeaderContext";
import { ClientProvider } from "@/src/models/user.preferences";
import { useDailyClient } from "@/src/contexts/DailyClientContext";

const allowLanguageSelection = true;
const allowVoiceSelection = true;
const showProviderSelection = false;// !process.env.NEXT_PUBLIC_PROVIDER;
const isDisabled = false;
const showFooter = true;
const PROVIDERS = [
  { id: 'dailybots', name: 'DailyBots' },
  { id: 'hume', name: 'Hume' },
];

export default function Settings() {
  const { branding } = useHeader();
  const { user, syncLocalUser, updateUser } = useUser();
  const { isStarted = false } = useDailyClient() ?? {};

  const statusRef = useRef<StatusIndicatorHandle>(null);

  const [localUser, setLocalUser] = useState(defaultUser);

  const [emailToConnect, setEmailToConnect] = useState<string>('');

  const [filteredVoices, setFilteredVoices] = useState(VOICES);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'entries' | 'account' | null>(null);

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
    
    if (id === 'provider') {
      newLocalUser.preferences.provider = value as ClientProvider;
      trackEvent("app", "provider-updated", { userId: user?.userId, provider: value });
    } else if (id === 'name' || id === 'city') {
      newLocalUser.profile[id] = value;
    } else if (id === 'voiceId' || id === 'languageId') {
      if (id === 'languageId') {
        newLocalUser.preferences.botPreferences[branding.botType].languageId = value;
        trackEvent("app", "language-updated", { userId: user?.userId, languageId: value });
        const voices = VOICES.filter(voice => voice.languageId === value);
        setFilteredVoices(voices);
        const defaultVoice = voices[0]?.id;
        if (defaultVoice) {
          newLocalUser.preferences.botPreferences[branding.botType].voiceId = defaultVoice;
          trackEvent("app", "voice-updated", { userId: user?.userId, voiceId: defaultVoice });
          trackEvent("app", voices[0].sex === 'male' ? 'male-voice-selected' : 'female-voice-selected', { userId: user?.userId, voiceId: defaultVoice });
          const audio = new Audio(`/audio/${defaultVoice}.wav`);
          try {
            await audio.play();
          } catch (error) {
            console.error('Failed to play audio sample:', error);
          }
        }
        const ttsSuffix = newLocalUser.preferences.botPreferences[branding.botType].languageId === 'en' ? 'english' : 'multilingual';
        newLocalUser.preferences.ttsModel = `sonic-${ttsSuffix}`;  
      } else {
        newLocalUser.preferences.botPreferences[branding.botType].voiceId = value;
        trackEvent("app", "voice-updated", { userId: user?.userId, voiceId: value });
        const voice = VOICES.find(voice => voice.id === value);
        if (voice) {
          trackEvent("app", voice.sex === 'male' ? 'male-voice-selected' : 'female-voice-selected', { userId: user?.userId, voiceId: value });
        }

        if (value) {
          const audio = new Audio(`/audio/${value}.wav`);
          try {
            await audio.play();
          } catch (error) {
            console.error('Failed to play audio sample:', error);
          } 
        }
      }
    } else if (id === 'vadStopSecs') {
      const numValue = parseFloat(value);
      newLocalUser.preferences.botPreferences[branding.botType][id] = numValue;
      trackEvent("app", "vad-updated", { userId: user?.userId, vadStopSecs: numValue });
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
          preferences: { 
            ...newLocalUser.preferences,
            provider: newLocalUser.preferences.provider || 'dailybots',
          }
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

  const handleDeleteAllEntries = useCallback(() => {
    setDeleteType('entries');
    setModalOpen(true);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    setDeleteType('account');
    setModalOpen(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    setModalOpen(false);
    setDeleteType(null);
    try {
      if (deleteType === 'entries') {
        await deleteAllJournalEntries();
        trackEvent("journals", "all-journal-deleted", { userId: user?.userId });
        await syncLocalUser();
        statusRef.current?.pushMessage({ type: 'success', text: 'All journal entries deleted successfully' });
      } else if (deleteType === 'account') {
        await deleteUser();
        trackEvent("auth", "account-deleted", { userId: user?.userId });
        statusRef.current?.pushMessage({ type: 'success', text: 'Account deleted successfully' });
        await syncLocalUser();
        await signOut();
        await new Promise(resolve => setTimeout(resolve, 2500));
        router.push('/');
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      statusRef.current?.pushMessage({ type: 'error', text: 'Failed to complete delete operation' });
    }
  }, [deleteType, router, syncLocalUser, user?.userId]);

  const handleCategoryChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;

    const newUser: Partial<User> = {
      ...user,
      preferences: {
        ...user.preferences,
        selectedConfig: e.target.value as ConfigCategory
      }
    };

    try {
      await updateUser(newUser);
      await syncLocalUser();
      statusRef.current?.pushMessage({ type: 'success', text: 'Category updated successfully' });
    } catch (error) {
      console.error('Failed to update category:', error);
      statusRef.current?.pushMessage({ type: 'error', text: 'Failed to update category' });
    }
  }, [user, syncLocalUser, updateUser]);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen bg-background">
        <Header />

        <main className="px-4 min-h-0">
            <div className="max-w-2xl mx-auto space-y-6 text-primary py-6">
                <div className="space-y-4">

                    <div className="form-group">
                        <label htmlFor="email" className="block mb-2">Email</label>
                        <InputWithButton
                            value={localUser.profile.email || emailToConnect}
                            onChange={(newEmail) => {
                                setEmailToConnect(newEmail);
                            }}
                            readOnly={!!localUser.profile.email && localUser.profile.email !== ''}
                            onButtonClick={handleSendMagicLink}
                            placeholder="you@example.com"
                            buttonLabel="Connect"
                            shouldShowButton={!isValidEmail(localUser.profile.email)}
                            disabled={!isValidEmail(emailToConnect)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category" className="block mb-2">Default Category</label>
                        <select 
                            value={user?.preferences.selectedConfig ?? 'journaling'}
                            onChange={handleCategoryChange}
                            className="w-full p-2 bg-surface-1 rounded"
                        >
                            <option value="journaling">Journaling 📝</option>
                            <option value="dating">Dating 💝</option>
                            <option value="solutions">Problem Solving 🎯</option>
                            <option value="gratitude">Gratitude ✨</option>
                            {/* <option value="growth">Personal Growth 🌱</option>
                            <option value="creativity">Creativity 🎨</option> */}
                        </select>
                    </div>

                    {showProviderSelection && (
                    <div className="form-group">
                        <label htmlFor="provider" className="block mb-2">Provider</label>
                        <select
                            id="provider"
                            value={localUser.preferences.provider}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-surface-1 border border-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isDisabled || !showProviderSelection}
                        >
                            {PROVIDERS.map(provider => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    )}

                    {localUser.preferences.provider === 'dailybots' && (
                        <>
                            {allowVoiceSelection && (
                                <div className="form-group">
                                    <label htmlFor="voiceId" className="block mb-2">Voice</label>
                                    <select
                                        id="voiceId"
                                        value={localUser.preferences.botPreferences[branding.botType].voiceId}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-surface-1 border border-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isDisabled}
                                    >
                                        {filteredVoices.map(voice => (
                                            <option key={voice.id} value={voice.id}>
                                                {`${COUNTRY_ICONS[voice.country] || ''} ${voice.name}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="vadStopSecs" className="block mb-2">
                                    Delay Before Response: <span className="text-secondary">{localUser.preferences.botPreferences[branding.botType].vadStopSecs}s</span>
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

                            {allowLanguageSelection && (
                                <div className="form-group">
                                    <label htmlFor="languageId" className="block mb-2">Language</label>
                                    <select
                                        id="languageId"
                                        value={localUser.preferences.botPreferences[branding.botType].languageId}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded bg-surface-1 border border-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isDisabled}
                                    >
                                        {Object.values(LANGUAGES).map(language => (
                                            <option key={language.id} value={language.id}>
                                                {language.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-between space-x-4">
                        <button
                            onClick={handleDeleteAllEntries}
                            className="w-full p-2 bg-orange-500 text-red rounded hover:bg-orange-600"
                        >
                            Delete All Journal Entries
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full p-2 bg-red-600 text-primary rounded hover:bg-red-700"
                        >
                            Delete Account
                        </button>
                    </div>

                    <ConfirmationModal
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                        onConfirm={handleDeleteConfirmed}
                        message={deleteType === 'entries'
                            ? "All journal entries will be permanently deleted."
                            : `Your account and journal entries will be permanently deleted.`}
                    />

                    <div className="flex items-center justify-between min-h-[20px]">
                        <StatusIndicator
                            ref={statusRef}
                        />
                    </div>
                </div>
            </div>
        </main>

        {localUser.preferences.provider === 'dailybots' && isStarted && showFooter && (
            <footer className="bg-backgroundborder-t border-gray-800 p-2 flex justify-center">
                <DailyVoiceControls />
            </footer>
        )}
    </div>
  );
}
