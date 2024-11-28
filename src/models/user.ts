import { JournalEntry, toJournalEntries } from "@/src/models/journal.entry";
import { LLM_INNER_ECHO_SYSTEM_PROMPT_FIRST_TIME_MESSAGE, LLM_INNER_ECHO_SYSTEM_PROMPT_GREETING_MESSAGE, LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_MESSAGE, LLM_SYSTEM_PROMPT_DISCONNECT_INSTRUCTIONS, LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS, LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS, LLM_VENTING_MACHINE_SYSTEM_PROMPT_FIRST_TIME_MESSAGE, LLM_VENTING_MACHINE_SYSTEM_PROMPT_GREETING_MESSAGE } from "@/src/models/prompts";
import { UserPreferences, defaultUserPreferences, generateSystemMessage, getVadConfig, getTtsConfig, getLlmConfig, getSttConfig, defaultVentingMachineUserPreferences } from "@/src/models/user.preferences";
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
  const systemPromptChunks = [
    LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
    LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS
  ];

  generateSystemMessage(user.preferences).forEach(prefChunk => systemPromptChunks.push(prefChunk));

  systemPromptChunks.push(LLM_SYSTEM_PROMPT_DISCONNECT_INSTRUCTIONS);

  if (user.isNewUser) {
    const introductionMessage = [
      LLM_INNER_ECHO_SYSTEM_PROMPT_FIRST_TIME_MESSAGE,
    ];
    introductionMessage.forEach(message => systemPromptChunks.push(message));
  } 
  else {
    systemPromptChunks.push(LLM_INNER_ECHO_SYSTEM_PROMPT_GREETING_MESSAGE);
    if (user.journalEntries.length > 0) {
      systemPromptChunks.push(LLM_INNER_ECHO_SYSTEM_PROMPT_SUMMARY_MESSAGE);
      user.journalEntries.filter(entry => !!entry.summary).forEach(entry => systemPromptChunks.push("past conversation summary: " + entry.summary));
    }
  } 

  const config = [
    getVadConfig(user.preferences),
    getTtsConfig(user.preferences),
    getLlmConfig(user.preferences, systemPromptChunks.join(' ')),
    getSttConfig(user.preferences),
  ];

  console.log('inner echo config: ', config);

  return config;
}

export function generateConfigForVentingMachine(user: User) {
  const systemPromptChunks = [
    LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
    LLM_SYSTEM_PROMPT_VARIANCE_INSTRUCTIONS,
  ];

  generateSystemMessage(defaultVentingMachineUserPreferences).forEach(prefChunk => systemPromptChunks.push(prefChunk));

  systemPromptChunks.push(LLM_SYSTEM_PROMPT_DISCONNECT_INSTRUCTIONS);

  if (user.isNewUser) {
    const introductionMessage = [
      LLM_VENTING_MACHINE_SYSTEM_PROMPT_FIRST_TIME_MESSAGE,
    ];
    introductionMessage.forEach(message => systemPromptChunks.push(message));
  } 
  else {
    systemPromptChunks.push(LLM_VENTING_MACHINE_SYSTEM_PROMPT_GREETING_MESSAGE);
  } 

  const config = [
    getVadConfig(user.preferences),
    getTtsConfig(user.preferences),
    getLlmConfig(user.preferences, systemPromptChunks.join(' ')),
    getSttConfig(user.preferences),
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
