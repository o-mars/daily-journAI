import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/firebase.admin';
import { generateSummary, generateTitle, generateTransformedEntry } from '@/app/lib/openai.admin';


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

    const { text: transcript } = await request.json();
    if (!transcript) {
      return NextResponse.json({ error: "Got no transcript for analysis" }, { status: 400 });
    }

    const [summaryResponse, titleResponse, transformedResponse] = await Promise.all([
      generateSummary(transcript),
      generateTitle(transcript),
      generateTransformedEntry(transcript),
    ]);

    return NextResponse.json({
      summary: summaryResponse,
      title: titleResponse,
      transformedEntry: transformedResponse,
    });
  } catch (error) {
    console.error('Error processing transcript for analysis:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
