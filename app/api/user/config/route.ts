import { NextResponse } from 'next/server';
import { auth, getUser, getRecentJournalEntries, updateUser } from '@/app/lib/firebase.admin';
import { generateHumeConfigForUserWithJournalEntries } from '@/src/services/humeConfigService';
import { publishConfig } from '@/app/lib/hume.admin';
import { HumeConfigId } from '@/src/models/hume.config';
import { DEFAULT_HUME_CONFIG_ID } from '@/src/models/constants';

/*
 GET = get config id for user from firebase, if not found, create default hume config, save to firebase, and then return config id

      instead of a post/put, should we retrieve user, create config using user data, save to firebase, and then return config id?
      you can have a failsafe to use the default config if the custom one doesn't get created/returned

 POST = update hume config for user, save to firebase, and then return config id
 PUT = update hume config for user, save to firebase, and then return config id
*/

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const user = await getUser(userId);

    const recentJournalEntries = await getRecentJournalEntries(userId);

    const config = generateHumeConfigForUserWithJournalEntries(user, recentJournalEntries);

    const response = await publishConfig(config);

    const humeConfigId: HumeConfigId = {
      id: response.id ?? DEFAULT_HUME_CONFIG_ID,
      version: response.id ? response.version : undefined,
    };
    user.preferences.humeConfigId = humeConfigId;

    await updateUser(user.userId, user); // We don't need to block on this since we have the config to use?

    return NextResponse.json(humeConfigId);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}