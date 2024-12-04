import { auth, getJournalEntry } from '@/app/lib/firebase.admin';
import { NextResponse } from 'next/server';


export async function GET(request: Request, { params }: { params: Record<string, string> }) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { id } = params;

    const response = await getJournalEntry(userId, id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
} 
