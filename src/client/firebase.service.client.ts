import { JournalConversationEntry, JournalEntry } from "@/src/models/journal.entry";
import { toUser, User } from "@/src/models/user";
import { getAuth } from "firebase/auth";

export const USER_PATH = 'test';

export async function fetchUser(userId: string): Promise<User> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user: ' + userId);
    const response = await fetch('/api/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch user');
    
    const userData = await response.json();
    const user = toUser(userData);
    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user, got error');
  }
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch('/api/user/journal', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Failed to get recent journal entries: ${response.statusText}`);

    const result: JournalEntry[] = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw new Error('Failed to get journal entries');
  }
}

export async function saveUpdatedUser(data: Partial<User>) {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user: ' + data.userId);
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

export async function saveJournalEntry(conversation: JournalConversationEntry[]) {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch('/api/user/journal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversation)
    });

    if (!response.ok) throw new Error(`Failed to save journal entry: ${response.statusText}`);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving journal entry:", error);
  }
}

export async function submitFeedback(entryId: string, rating: number, comment: string) {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entryId, rating, comment }),
    });

    if (!response.ok) throw new Error("Failed to submit feedback");
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting feedback:", error);
  }
}
