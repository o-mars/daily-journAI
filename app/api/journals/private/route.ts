import { NextResponse } from 'next/server';
import { auth, doNotAddJournalEntry } from '@/app/lib/firebase.admin';

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { conversation, metadata } = await request.json();

    await doNotAddJournalEntry(userId, conversation, metadata);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
