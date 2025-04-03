import { auth, storage } from '@/app/lib/firebase.admin';
import { NextRequest, NextResponse } from 'next/server';
import { firebaseConfig } from '@/firebase.config';

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
    const id = parts[parts.length - 2]; // Get the journal entry ID from the URL

    if (!id) {
      return NextResponse.json({ error: 'ID not found' }, { status: 400 });
    }

    const recordingRef = storage.bucket(firebaseConfig.storageBucket).file(`users/${userId}/${id}.webm`);
    
    const [exists] = await recordingRef.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    const [metadata] = await recordingRef.getMetadata();
    
    const [url] = await recordingRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    });

    return NextResponse.json({
      url,
      contentType: metadata.contentType,
      size: metadata.size,
      updated: metadata.updated
    });
  } catch (error) {
    console.error("Error retrieving recording:", error);
    return NextResponse.json({ error: "Failed to retrieve recording" }, { status: 500 });
  }
} 