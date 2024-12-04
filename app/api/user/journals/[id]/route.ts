import { auth, getJournalEntry } from '@/app/lib/firebase.admin';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { pathname } = request.nextUrl;

    const parts = pathname.split('/');
    const id = parts[parts.length - 1];
  
    if (!id) {
      return NextResponse.json({ error: 'ID not found' }, { status: 400 });
    }

    const response = await getJournalEntry(userId, id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
} 
