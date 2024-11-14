import { DocumentData } from "firebase/firestore";

export class Mood {
  id?: string;
  createdAt: Date;
  label: string;
  score: number;
  source: string;

  constructor(label: string, score: number, source: string, createdAt = new Date(), id?: string) {
    this.label = label;
    this.score = score;
    this.source = source;
    this.createdAt = createdAt;
    if (id) this.id = id;
  }

  static toMood(document: DocumentData) {
    const id = document['id'];
    const createdAt = document['createdAt'];
    const label = document['label'];
    const score = document['score'];
    const source = document['source'];

    const mood = new Mood(label, score, source, createdAt, id);
    return mood;
  }

  static generateMoodPrompt(moodEntries: Mood[]) {
    const moodPrompt = [
      "You are a journalling assistant, but don't tell them that unless they ask.",
      "Say hello, before asking them how they're doing, how they're feeling, about their mood, but explore each question with them before proceeding to the next one.",
      "Even though you have an agenda, don't tell them what it is, just let them discover it as you naturally ask them about their day.",
    ]

    if (moodEntries.length === 0) return moodPrompt;

    const moodLabels = moodEntries.map(m => m.label);
    moodPrompt.push(`These are the mood entries the user has shared in past sessions, going from recent to old: ${moodLabels.join(', ')}`);

    return moodPrompt;
  }
}