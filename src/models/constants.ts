import { Language, Voice } from "@/src/models/voice";

export const ONE_MINUTE_MS = 1000 * 60;
export const ONE_HOUR_MS = ONE_MINUTE_MS * 60;
export const MAX_JOURNAL_ENTRIES = 3;
export const USER_PATH = 'users';
export const JOURNAL_ENTRIES_PATH = 'journalEntries';
export const SUMMARIZED_JOURNAL_ENTRIES_PATH = 'metrics-journal-entries';
export const METRICS_JOURNAL_ENTRIES_PATH = 'metrics-journal-entry';
export const METRICS_TELEPHONY_PATH = 'metrics-telephony';
export const SUMMARY_NONE = 'None';
export const TITLE_NONE = 'None';
export const JOURNAL_ENTRY_TITLE_DEFAULT = 'Loading Journal Entry...';

export const CHECK_EMAIL_MESSAGE = "Check your email for the sign-in link!";
export const DEFAULT_VOICE_ID = '794f9389-aac1-45b6-b726-9d9369183238';
export const DEFAULT_LANGUAGE_ID = 'en';


export const EMAIL_STORAGE_KEY = 'innerecho:email';
export const PHONE_STORAGE_KEY = 'innerecho:phone';

export const PHONE_AUTH_TEST_MODE = process.env.PHONE_AUTH_TEST_MODE === 'true';
export const LANGUAGES: Record<string, Language> = {
  'en': { id: 'en', name: 'English' },
  'es': { id: 'es', name: 'Spanish' },
  'fr': { id: 'fr', name: 'French' },

  // 'zh': { id: 'zh', name: 'Chinese' },
  // 'ja': { id: 'ja', name: 'Japanese' },
  // 'ko': { id: 'ko', name: 'Korean' },

  // 'hi': { id: 'hi', name: 'Hindi' },
  // 'ru': { id: 'ru', name: 'Russian' },
};

export const VOICES: Voice[] = [
  { id: '794f9389-aac1-45b6-b726-9d9369183238', name: 'Sarah', region: 'X', country: 'US', sex: 'female', languageId: 'en' },
  { id: 'a0e99841-438c-4a64-b679-ae501e7d6091', name: 'Mark', region: 'X', country: 'US', sex: 'male', languageId: 'en' },
  { id: '03496517-369a-4db1-8236-3d3ae459ddf7', name: 'Ava', region: 'X', country: 'EU', sex: 'female', languageId: 'en' },
  { id: '729651dc-c6c3-4ee5-97fa-350da1f88600', name: 'Jaime', region: 'X', country: 'EU', sex: 'male', languageId: 'en' }, 
  { id: '79a125e8-cd45-4c13-8a67-188112f4dd22', name: 'Olivia', region: 'X', country: 'UK', sex: 'female', languageId: 'en' },
  { id: '40104aff-a015-4da1-9912-af950fbec99e', name: 'Peter', region: 'X', country: 'US', sex: 'male', languageId: 'en' },
  { id: '3b554273-4299-48b9-9aaf-eefd438e3941', name: 'Sonia', region: 'X', country: 'IN', sex: 'female', languageId: 'en' },
  { id: '638efaaa-4d0c-442e-b701-3fae16aad012', name: 'Raj', region: 'X', country: 'IN', sex: 'male', languageId: 'en' },

  { id: 'a956b555-5c82-404f-9580-243b5178978d', name: 'Woman', region: 'X', country: 'ES', sex: 'female', languageId: 'es' },
  { id: '15d0c2e2-8d29-44c3-be23-d585d5f154a1', name: 'Man', region: 'X', country: 'ES', sex: 'male', languageId: 'es' },
  { id: 'a249eaff-1e96-4d2c-b23b-12efa4f66f41', name: 'Woman', region: 'X', country: 'FR', sex: 'female', languageId: 'fr' },
  { id: 'ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3', name: 'Man', region: 'X', country: 'FR', sex: 'male', languageId: 'fr' },

  { id: '95d51f79-c397-46f9-b49a-23763d3eaa2d', name: 'Woman', region: 'X', country: 'IN', sex: 'female', languageId: 'hi' },
  { id: 'ac7ee4fa-25db-420d-bfff-f590d740aeb2', name: 'Man', region: 'X', country: 'IN', sex: 'male', languageId: 'hi' },

  { id: '779673f3-895f-4935-b6b5-b031dc78b319', name: 'Woman', region: 'X', country: 'RU', sex: 'female', languageId: 'ru' },
  { id: 'da05e96d-ca10-4220-9042-d8acef654fa9', name: 'Man', region: 'X', country: 'RU', sex: 'male', languageId: 'ru' },

  { id: 'e90c6678-f0d3-4767-9883-5d0ecf5894a8', name: 'Woman', region: 'X', country: 'CN', sex: 'female', languageId: 'zh' },
  { id: '3a63e2d1-1c1e-425d-8e79-5100bc910e90', name: 'Man', region: 'X', country: 'CN', sex: 'male', languageId: 'zh' },
  { id: '2b568345-1d48-4047-b25f-7baccf842eb0', name: 'Woman', region: 'X', country: 'JP', sex: 'female', languageId: 'ja' },
  { id: 'e8a863c6-22c7-4671-86ca-91cacffc038d', name: 'Man', region: 'X', country: 'JP', sex: 'male', languageId: 'ja' },
  { id: '29e5f8b4-b953-4160-848f-40fae182235b', name: 'Woman', region: 'X', country: 'KR', sex: 'female', languageId: 'ko' },
]


export const COUNTRY_ICONS: Record<string, string> = {
  'US': '🇺🇸',
  'UK': '🇬🇧',
  'FR': '🇫🇷',
  'AU': '🇦🇺',
  'IN': '🇮🇳',
  'PK': '🇵🇰',
  'CA': '🇨🇦',
  'DE': '🇩🇪',
  'ES': '🇪🇸',
  'IT': '🇮🇹',
  'CN': '🇨🇳',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'BR': '🇧🇷',
  'AR': '🇦🇷',
  'MX': '🇲🇽',
  'EU': '🇪🇺',
  'UAE': '🇦🇪',
  'RU': '🇷🇺',
}
