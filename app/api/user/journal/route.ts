import { NextResponse } from 'next/server';
import { addJournalEntry, auth, getJournalEntries } from '../../../lib/firebase.admin';

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const response = await getJournalEntries(userId);
    return NextResponse.json(response);
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

    const { conversation, botType } = await request.json();

    const response = await addJournalEntry(userId, botType, conversation);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
