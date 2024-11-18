import { JournalConversationEntry, JournalEntry } from "@/src/models/journal.entry";
import { Mood } from "@/src/models/mood";
import { User } from "@/src/models/user";
import { getAuth } from "firebase/auth";

export const USER_PATH = 'test';

export async function getUser(userId: string): Promise<User> {
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
    const user = User.toUser(userData);
    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch user, got error');
  }
}

export async function updateUser(data: Partial<User>) {
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
    console.log("User update result:", result);
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
    console.log("Journal Entry Saved:", result);
    return result;
  } catch (error) {
    console.error("Error saving mood entries:", error);
  }
}
