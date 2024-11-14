import { JournalEntry } from "@/src/models/journal.entry";
import { Mood } from "@/src/models/mood";
import { UserPreferences } from "@/src/models/user.preferences";
import { DocumentData, Timestamp } from "firebase/firestore";

const introductionMessage = [
  "Introduce yourself warmly as someone here to help them explore their thoughts and feelings through voice journaling.",
  "Let them know they can share as much or as little as they’re comfortable with.",
  "Start by asking if there’s something on their mind or a feeling they’d like to explore today.",
  "Keep the conversation easy-going and natural, letting them lead with what they’d like to discuss."
];

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
  hasMoodEntries = false;

  constructor(userId: string, createdAt: Date) {
    this.userId = userId;
    this.createdAt = createdAt;
  }

  generateConfig() {
    const systemPromptChunks = [
      "Your responses will converted to audio.",
      "Please do not include any special characters in your response other than '!' or '?'.",
      "They are also speaking to you, and their response is being converted to text before being sent to you.",
    ];

    if (!this.hasMoodEntries) introductionMessage.map(message => systemPromptChunks.push(message));
    else Mood.generateMoodPrompt(this.moodEntries).map(moodChunk => systemPromptChunks.push(moodChunk));

    this.preferences.generateSystemMessage().map(prefChunk => systemPromptChunks.push(prefChunk));

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
    } 

    return user;
  }
}
