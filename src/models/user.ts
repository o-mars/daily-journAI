import { JournalEntry, toJournalEntries } from "@/src/models/journal.entry";
import { UserPreferences, defaultUserPreferences, generateSystemMessage, getVadConfig, getTtsConfig, getLlmConfig, getSttConfig } from "@/src/models/user.preferences";
import { DocumentData } from "firebase/firestore";

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

export function generateConfig(user: User) {
  const systemPromptChunks = [
    "Your responses will converted to audio, so please don't include any special characters, your response should work if piped to a speech-to-text service.",
    "They are also speaking to you, and their response is being converted to text before being sent to you.",
    `Vary your language and expressions to keep the conversation engaging. Avoid starting responses with the same phrase. e.g. "It sounds like"`
  ];

  generateSystemMessage(user.preferences).forEach(prefChunk => systemPromptChunks.push(prefChunk));

  systemPromptChunks.push("Once the conversation has ended, or if they say goodbye, you should say goodbye but also disconnect the session by calling the function `disconnect_voice_client`.");

  if (user.isNewUser) {
    const introductionMessage = [
      `Say the following: "Hello. I'm here to help you journal. How have you been feeling today? Anything on your mind?"`,
    ];
    introductionMessage.forEach(message => systemPromptChunks.push(message));
  } 
  else {
    systemPromptChunks.push("You are a journalling assistant, but don't tell them that unless they ask.");
    systemPromptChunks.push("Say hello, before asking them about how they're feeling, and help them explore this feeling.");
    if (user.journalEntries.length > 0) {
      systemPromptChunks.push(`Here are the summaries of the last couple of conversations the user has had with you.`);
      systemPromptChunks.push(`Only reference them if the user says something that might relate to it. Focus on how the user is presently feeling.`);
      user.journalEntries.filter(entry => !!entry.summary).forEach(entry => systemPromptChunks.push("past conversation summary: " + entry.summary));
    }
  } 

  // console.log('systemPromptChunks: ', systemPromptChunks);

  const config = [
    getVadConfig(user.preferences),
    getTtsConfig(user.preferences),
    getLlmConfig(user.preferences, systemPromptChunks.join(' ')),
    getSttConfig(user.preferences),
  ];

  return config;
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