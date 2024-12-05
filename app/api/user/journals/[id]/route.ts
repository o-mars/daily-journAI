import { auth, getJournalEntry, deleteJournalEntry, updateJournalEntry } from '@/app/lib/firebase.admin';
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

export async function DELETE(request: NextRequest) {
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

    await deleteJournalEntry(userId, id);
    return NextResponse.json({ message: 'Journal entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
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

    const updates = await request.json();
    await updateJournalEntry(userId, id, updates);
    return NextResponse.json({ message: 'Journal entry updated successfully' });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json({ error: "Failed to update journal entry" }, { status: 500 });
  }
}
