// Example API route to get user
import { getUser, updateUser, auth, getRecentJournalEntries, getJournalEntriesCount, deleteUser, createUser } from '@/app/lib/firebase.admin';
import { defaultUserPreferences } from '@/src/models/user.preferences';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const user = await getUser(userId);

    const journalEntriesCount = await getJournalEntriesCount(userId);
    user.isNewUser = journalEntriesCount === 0;

    const recentJournalEntries = await getRecentJournalEntries(userId);
    user.journalEntries = recentJournalEntries;

    let needsUpdate = false;
    if (!user.preferences.humeConfigs) {
      user.preferences.humeConfigs = defaultUserPreferences.humeConfigs;
      needsUpdate = true;
    }
    if (!user.preferences.selectedConfig) {
      user.preferences.selectedConfig = defaultUserPreferences.selectedConfig;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await updateUser(user.userId, user);
    }
    
    console.log('returning user from backend using next response: ', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userData = await request.json();

    await createUser(userId, userData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userData = await request.json();

    updateUser(userId, userData);

    return NextResponse.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("Error verifying ID token or updating document:", error);
    return NextResponse.json({ error: "Failed to update User" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    await deleteUser(userId);
    return NextResponse.json({ message: 'User and all journal entries deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
