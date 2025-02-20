import { NextResponse } from 'next/server';
import { addJournalEntry, auth, deleteAllJournalEntries, getJournalEntries, getRecentJournalEntries, getUser, updateUser } from '@/app/lib/firebase.admin';
import { publishConfig, updatePublishedConfig } from '@/app/lib/hume.admin';
import { CONFIG_TEMPLATES, HumeConfigId } from '@/src/models/configs/hume/hume.config';
import { defaultUserPreferences } from '@/src/models/user.preferences';
import { ConfigCategory } from '@/src/models/categories.config';

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

    const { conversation, metadata, category } = await request.json();

    const journalPromise = addJournalEntry(userId, conversation, metadata);

    const configUpdatePromise = (async () => {
      const [user, recentJournalEntries] = await Promise.all([
        getUser(userId),
        getRecentJournalEntries(userId)
      ]);

      if (!user.preferences.humeConfigs) {
        user.preferences.humeConfigs = defaultUserPreferences.humeConfigs;
      }

      const configCategory = category as ConfigCategory;
      const defaultConfigId = CONFIG_TEMPLATES[configCategory].defaultConfigId;
      const config = CONFIG_TEMPLATES[configCategory].generateConfig(user, recentJournalEntries);
      const currentConfigId = user.preferences.humeConfigs[configCategory].id;
      const shouldCreateConfigVersion = currentConfigId !== defaultConfigId;

      const humeConfigResponse = shouldCreateConfigVersion
        ? await updatePublishedConfig(currentConfigId, config)
        : await publishConfig(config);
        
      const humeConfigId: HumeConfigId = {
        id: humeConfigResponse.id ?? defaultConfigId,
        version: humeConfigResponse.id ? humeConfigResponse.version : undefined,
      };
      
      user.preferences.humeConfigs[configCategory] = humeConfigId;
      return updateUser(user.userId, user);
    })();

    // Wait for journal entry but not config update
    const response = await journalPromise;
    
    // Fire and forget the config update
    configUpdatePromise.catch(error => {
      console.error("Error updating Hume config:", error);
      // You might want to log this to your error tracking service
    });

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
