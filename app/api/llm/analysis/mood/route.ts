import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/firebase.admin';
import { generateTransformedEntry } from '@/app/lib/openai.admin';
import { JournalConversationEntry } from '@/src/models/journal.entry';


export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const conversation: JournalConversationEntry[] = await request.json();
    if (!conversation) {
      return NextResponse.json({ error: "Got no transcript for analysis" }, { status: 400 });
    }

    const transformedResponse = await generateTransformedEntry(conversation);

    return NextResponse.json({
      transformedEntry: transformedResponse,
    });
  } catch (error) {
    console.error('Error processing transcript for analysis:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
