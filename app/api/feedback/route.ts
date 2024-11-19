import { NextResponse } from "next/server";
import { auth, submitFeedback } from '../../lib/firebase.admin';

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { rating, comment, entryId } = await request.json();

    const response = submitFeedback(userId, rating, comment, entryId);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}