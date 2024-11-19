import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/firebase.admin';
import { openai } from '@/app/lib/openai.admin';

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

    console.log('about to do open ai analysis on transcript...   ' + transcript.substr(0, 14));
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You have going to receive a journalling entry transcript between a user and an assistant."
            },
            {
              type: "text",
              text: "Analyze the user's response to determine their mood. They might be feeling many different things."
            },
            {
              type: "text",
              text: "Respond with only raw JSON, as an array of objects in the following format: {label:single-word-string,score:0-10,source:string-where-label-was-fetched}."
            },
            {
              type: "text",
              text: "The content of this response will be used directly to parse JSON, don't even include ``` to format your response, pure JSON string."
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: transcript
            }
          ],
        },
      ],
    });

    const moods = response.choices[0].message.content;
    return NextResponse.json(moods);
  } catch (error) {
    console.error('Error processing transcript for analysis:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
