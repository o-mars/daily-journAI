import { JournalConversationEntry, JournalEntry } from "@/src/models/journal.entry";
import { getAuth } from "firebase/auth";

export async function generateTransformedEntry(conversation: JournalConversationEntry[]): Promise<Partial<JournalEntry>> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user');
    const response = await fetch('/api/llm/analysis/mood', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversation)
    });

    if (!response.ok) throw new Error('Failed to analyze transcript');

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return {};
  }
}
