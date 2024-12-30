import { NextResponse } from 'next/server';
import { addJournalEntry, auth, deleteAllJournalEntries, getJournalEntries, getRecentJournalEntries, getUser, updateUser } from '@/app/lib/firebase.admin';
import { generateHumeConfigForUserWithJournalEntries } from '@/src/services/humeConfigService';
import { publishConfig, updatePublishedConfig } from '@/app/lib/hume.admin';
import { HumeConfigId } from '@/src/models/hume.config';
import { DEFAULT_HUME_CONFIG_ID } from '@/src/models/constants';

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

    const { conversation, metadata } = await request.json();

    const response = await addJournalEntry(userId, conversation, metadata);

    //// Hume Config Update
    const user = await getUser(userId);
    const recentJournalEntries = await getRecentJournalEntries(userId);
    const config = generateHumeConfigForUserWithJournalEntries(user, recentJournalEntries);
    const shouldCreateConfigVersion = user.preferences.humeConfigId.id !== DEFAULT_HUME_CONFIG_ID; // user.preferences.humeConfigId.version !== undefined;
    const humeConfigResponse = shouldCreateConfigVersion ? await updatePublishedConfig(user.preferences.humeConfigId.id, config) : await publishConfig(config);
    const humeConfigId: HumeConfigId = {
      id: humeConfigResponse.id ?? DEFAULT_HUME_CONFIG_ID,
      version: humeConfigResponse.id ? humeConfigResponse.version : undefined,
    };
    user.preferences.humeConfigId = humeConfigId;
    await updateUser(user.userId, user); // We don't need to block on this since we have the config to use?
    // End of Hume Config Update

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    await deleteAllJournalEntries(userId);
    return NextResponse.json({ message: 'Journal entries deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
