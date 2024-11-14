// Example API route to get user
import { getUser, updateUser, auth, getRecentMood, getMoodCount } from '@/app/lib/firebase.admin';
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

    const moodCount = await getMoodCount(userId);
    user.hasMoodEntries = moodCount > 0;

    const recentMoodEntries = await getRecentMood(userId);
    user.moodEntries = recentMoodEntries;
    
    console.log('returning user from backend using next response: ', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
