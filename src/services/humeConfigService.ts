import { PostedLanguageModel, PostedVoice } from "hume/api/resources/empathicVoice";
import { PostedConfig } from "hume/api/resources/empathicVoice/resources/configs/client";
import { defaultHumeSystemPrompt, generateHumeSystemPromptForUser, generateHumeSystemPromptForUserWithJournalEntries, HumeSystemPrompt, humeSystemPromptAsString } from "@/src/models/hume.config";
import { User } from "@/src/models/user";
import { JournalEntry } from "@/src/models/journal.entry";
import { HUME_FIRST_TIME_MESSAGE, HUME_RETURNING_FIRST_MESSAGE } from "@/src/models/prompts";
import { fetchAccessToken } from "hume";
import { trackEvent } from "@/src/services/metricsSerivce";

export const baseVoice: PostedVoice = {
  name: 'KORA',
  provider: 'HUME_AI',
}

// TODO: This results in an error, maybe you aren't supposed to use this if using the system default evi2
export const baseLanguageModel: PostedLanguageModel = {
  modelProvider: 'CUSTOM_LANGUAGE_MODEL',
  modelResource: 'ellm',
}

export function generateHumeConfigForUser(user: User): PostedConfig {
  const humeSystemPrompt: HumeSystemPrompt = generateHumeSystemPromptForUser(user);
  return generateHumeConfigWithPrompt(humeSystemPrompt, user);
}

export function generateHumeConfigForUserWithJournalEntries(user: User, journalEntries: JournalEntry[]): PostedConfig {
  const humeSystemPrompt: HumeSystemPrompt = generateHumeSystemPromptForUserWithJournalEntries(user, journalEntries);
  const humeConfig = generateHumeConfigWithPrompt(humeSystemPrompt, user);
  return humeConfig;
}

export const baseHumeConfig: PostedConfig = generateHumeConfigWithPrompt(defaultHumeSystemPrompt);

export function generateHumeConfigWithPrompt(prompt: HumeSystemPrompt, user?: User): PostedConfig {
  const isFirstSession = !user || !user.journalEntries || user.journalEntries.length === 0;
  const humeConfig: PostedConfig = {
    eviVersion: '2',
    name: user ? `Config For ${user.userId}` : 'Journaling Assistant Config',
    versionDescription: 'Journaling assistant configuration',
    prompt: {
      text: humeSystemPromptAsString(prompt),
    },
    voice: baseVoice,
    // languageModel: baseLanguageModel,
    ellmModel: { allowShortResponses: true },
    eventMessages: {
      onNewChat: {
        enabled: true,
        text: isFirstSession ? HUME_FIRST_TIME_MESSAGE : HUME_RETURNING_FIRST_MESSAGE,
      },
      onInactivityTimeout: {
        enabled: true,
        text: "Are you still there?"
      },
      onMaxDurationTimeout: {
        enabled: true,
      }
    },
    timeouts: {
      inactivity: {
        enabled: true,
        durationSecs: 150,
      },
    }
  };

  return humeConfig;
}

export async function getHumeAccessToken(retries = 3, backoffMs = 1000): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const accessToken = await fetchAccessToken({
        apiKey: String(process.env.HUME_API_KEY),
        secretKey: String(process.env.HUME_SECRET_KEY),
      });

      if (!accessToken) throw new Error(`fetchAccessToken returned null`);
      return accessToken;

    } catch (error) {
      console.error(`Failed to fetch access token (attempt ${attempt}/${retries}): ${error}`);

      if (attempt === retries) {
        trackEvent("session", "session-error", {
          error: `Failed to fetch access token after ${retries} attempts`
        });
        throw error;
      }

      const delayMs = backoffMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Failed to fetch access token');
}

/*
To test different scenarios, temporarily replace getHumeAccessToken in page.tsx with:
const accessToken = await debugGetHumeAccessToken.success();
const accessToken = await debugGetHumeAccessToken.partialFailure();
const accessToken = await debugGetHumeAccessToken.failure();

interface DebugHumeAccessToken {
  success: () => Promise<string>;
  partialFailure: () => Promise<string>;
  failure: () => Promise<string>;
  _partialFailureAttempts: number;
  _lastAttemptTime: number;
}

export const debugGetHumeAccessToken: DebugHumeAccessToken = {
  success: async () => {
    return getHumeAccessToken();
  },

  partialFailure: async () => {
    // Reset counter if it's been more than 5 seconds since last attempt
    const now = Date.now();
    if (!debugGetHumeAccessToken._lastAttemptTime ||
        now - debugGetHumeAccessToken._lastAttemptTime > 5000) {
      debugGetHumeAccessToken._partialFailureAttempts = 0;
    }
    debugGetHumeAccessToken._lastAttemptTime = now;

    if (debugGetHumeAccessToken._partialFailureAttempts === 0) {
      debugGetHumeAccessToken._partialFailureAttempts++;
      console.warn(`Partial failure attempt ${debugGetHumeAccessToken._partialFailureAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getHumeAccessToken();
    }
    return getHumeAccessToken();
  },

  failure: async () => {
    throw new Error("Mock failure");
  },

  _partialFailureAttempts: 0,
  _lastAttemptTime: 0
};
*/
