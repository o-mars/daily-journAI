import { JournalEntry } from "@/src/models/journal.entry";
import { Mood } from "@/src/models/mood";
import { UserPreferences } from "@/src/models/user.preferences";
import { DocumentData } from "firebase/firestore";

export class UserProfile {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
}

export class User {
  userId: string;
  createdAt: Date;
  profile: UserProfile = {};
  preferences: UserPreferences = new UserPreferences();
  journalEntries: JournalEntry[] = [];
  moodEntries: Mood[] = [];
  isNewUser = true;

  constructor(userId: string, createdAt: Date) {
    this.userId = userId;
    this.createdAt = createdAt;
  }

  generateConfig() {
    const systemPromptChunks = [
      "Your responses will converted to audio, so please don't include any special characters, your response should work if piped to a speech-to-text service.",
      "They are also speaking to you, and their response is being converted to text before being sent to you.",
      `Vary your language and expressions to keep the conversation engaging. Avoid starting responses with the same phrase. e.g. "It sounds like"`
    ];

    this.preferences.generateSystemMessage().map(prefChunk => systemPromptChunks.push(prefChunk));

    if (this.isNewUser) {
      const introductionMessage = [
        `Say the following: "Hello. I'm here to help you journal. How have you been feeling today? Anything on your mind?"`,
        // "Briefly introduce yourself as someone here to help them explore their thoughts and feelings through journaling.",
        // "Start by asking about how they've been feeling today and wait for a response.",
      ];
      introductionMessage.map(message => systemPromptChunks.push(message));
    } 
    else {
      systemPromptChunks.push("You are a journalling assistant, but don't tell them that unless they ask.");
      systemPromptChunks.push("Say hello, before asking them about how they're feeling, and help them explore this feeling.");
      // systemPromptChunks.push("Even though you have an agenda, don't tell them what it is, just let them discover it as you naturally ask them about their day.");
      systemPromptChunks.push(`Here are the summaries of the last couple of conversations the user has had with you.`);
      systemPromptChunks.push(`Only reference them if the user says something that might relate to it. Focus on how the user is presently feeling.`);
      // systemPromptChunks.push(`Use these to inform your empathy but don't reference them unless they are directly relevant.`);
      this.journalEntries.filter(entry => !!entry.summary).map(entry => systemPromptChunks.push("past conversation summary: " + entry.summary));
    } 

    console.log(systemPromptChunks);

    const config = [
      this.preferences.getVadConfig(),
      this.preferences.getTtsConfig(),
      this.preferences.getLlmConfig(systemPromptChunks.join(' ')),
      this.preferences.getSttConfig(),
    ];

    return config;
  }

  static toUser(document: DocumentData): User {
    const userId = document['userId'];
    const createdAt = document['createdAt'];

    const user = new User(userId, createdAt);

    user.profile = document['profile'];

    if (!!document.preferences) user.preferences = UserPreferences.toUserPreferences(user.preferences);

    if (!!document.journalEntries) user.journalEntries = JournalEntry.toJournalEntries(user.journalEntries);
    user.journalEntries = document['journalEntries'];

    if (!!document.moodEntries) {
      const moodEntries = document.moodEntries.map((entry: DocumentData) => Mood.toMood(entry))
      user.moodEntries = moodEntries;
      user.isNewUser = moodEntries > 0;
    } 

    return user;
  }
}
