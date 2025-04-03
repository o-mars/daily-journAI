import { NextResponse } from 'next/server';
import { addJournalEntry, auth, deleteAllJournalEntries, getJournalEntries, getRecentJournalEntries, getUser, updateUser } from '@/app/lib/firebase.admin';
import { publishConfig, updatePublishedConfig } from '@/app/lib/hume.admin';
import { CONFIG_TEMPLATES, HumeConfigId } from '@/src/models/configs/hume/hume.config';
import { ClientProvider, defaultUserPreferences } from '@/src/models/user.preferences';
import { ConfigCategory } from '@/src/models/categories.config';
import { JournalEntryMetadata } from '@/src/models/journal.entry';
import { JournalConversationEntry } from '@/src/models/journal.entry';

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

    const formData = await request.formData();
    const conversation = JSON.parse(formData.get('conversation') as string) as JournalConversationEntry[];
    const metadata = JSON.parse(formData.get('metadata') as string) as JournalEntryMetadata;
    const category = formData.get('category') as ConfigCategory;
    const clientProvider = metadata.provider as ClientProvider;
    const recording = formData.get('recording') as Blob;

    const journalPromise = addJournalEntry(userId, conversation, metadata, recording);

    if (clientProvider === 'hume') {
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

      // Fire and forget the config update
      configUpdatePromise.catch(error => {
        console.error("Error updating Hume config:", error);
        // You might want to log this to your error tracking service
      });
    }

    const response = await journalPromise;

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
