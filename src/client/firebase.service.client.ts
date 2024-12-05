import { JournalConversationEntry, JournalEntry, JournalEntryMetadata } from "@/src/models/journal.entry";
import { toUser, User } from "@/src/models/user";
import { getAuth } from "firebase/auth";

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

    const response = await fetch('/api/user/journals', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Failed to get journal entries: ${response.statusText}`);

    const result: JournalEntry[] = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw new Error('Failed to get journal entries');
  }
}

export async function fetchJournalEntry(entryId: string): Promise<JournalEntry> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch(`/api/user/journals/${entryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Failed to get journal entry: ${response.statusText}`);

    const result: JournalEntry = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    throw new Error('Failed to get journal entry');
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

export async function saveJournalEntry(
  conversation: JournalConversationEntry[], 
  metadata: JournalEntryMetadata
) {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch('/api/user/journals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation, metadata })
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

export async function deleteJournalEntry(entryId: string): Promise<void> {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch(`/api/user/journals/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) throw new Error(`Failed to delete journal entry: ${response.statusText}`);
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
}

export async function updateJournalEntry(entryId: string, updates: Partial<JournalEntry>) {
  try {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Failed to fetch token for logged in user.');

    const response = await fetch(`/api/user/journals/${entryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error(`Failed to update journal entry: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
}
