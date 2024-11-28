import { JournalEntry, toJournalEntries } from "@/src/models/journal.entry";
import { generateSystemMessagesForInnerEcho, generateSystemMessagesForVentingMachine } from "@/src/models/prompts";
import { UserPreferences, defaultUserPreferences, getVadConfig, getTtsConfig, getLlmConfig, getSttConfig } from "@/src/models/user.preferences";
import { DocumentData } from "firebase/firestore";

export type BotType = 'inner-echo' | 'venting-machine';

export interface UserProfile {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  isAnonymous?: boolean;
}

export interface User {
  userId: string;
  createdAt: Date;
  profile: UserProfile;
  preferences: UserPreferences;
  journalEntries: JournalEntry[];
  isNewUser: boolean;
}

export const defaultUser: User = {
  userId: '',
  createdAt: new Date(),
  profile: {},
  preferences: defaultUserPreferences,
  journalEntries: [],
  isNewUser: true,
};

export function createUser(userId: string, createdAt: Date): User {
  return {
    ...defaultUser,
    userId,
    createdAt,
  };
}

export function generateConfigForInnerEcho(user: User) {
  const systemPromptChunks = generateSystemMessagesForInnerEcho(user);

  const config = [
    getVadConfig(user.preferences, 'inner-echo'),
    getTtsConfig(user.preferences, 'inner-echo'),
    getLlmConfig(user.preferences, systemPromptChunks.join(' ')),
    getSttConfig(user.preferences, 'inner-echo'),
  ];

  console.log('inner echo config: ', config);

  return config;
}

export function generateConfigForVentingMachine(user: User) {
  const systemPromptChunks = generateSystemMessagesForVentingMachine(user);

  const config = [
    getVadConfig(user.preferences, 'venting-machine'),
    getTtsConfig(user.preferences, 'venting-machine'),
    getLlmConfig(user.preferences, systemPromptChunks.join(' ')),
    getSttConfig(user.preferences, 'venting-machine'),
  ];

  console.log('venting machineconfig: ', config);

  return config;
}

export function generateConfigWithBotType(user: User, botType: BotType) {
  switch (botType) {
    case 'inner-echo':
      return generateConfigForInnerEcho(user);
    case 'venting-machine':
      return generateConfigForVentingMachine(user);
    default:
      return generateConfigForInnerEcho(user);
      // throw new Error(`Unknown bot type: ${botType}`);
  }
}

export function toUser(document: DocumentData): User {
  const userId = document['userId'];
  const createdAt = document['createdAt'];

  const user: User = createUser(userId, createdAt);

  user.profile = document['profile'] || {};
  user.preferences = document.preferences ? document.preferences : defaultUserPreferences;
  user.journalEntries = document.journalEntries ? toJournalEntries(document.journalEntries) : [];
  user.isNewUser = document.isNewUser ? document.isNewUser : user.journalEntries.length === 0;

  return user;
}
