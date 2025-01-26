import { PostedLanguageModel, PostedVoice } from "hume/api/resources/empathicVoice";
import { PostedConfig } from "hume/api/resources/empathicVoice/resources/configs/client";
import { User } from "@/src/models/user";
import { JournalEntry } from "@/src/models/journal.entry";
import { fetchAccessToken } from "hume";
import { trackEvent } from "@/src/services/metricsSerivce";
import { generateDatingPostedConfig } from "@/src/models/hume/configs/dating";
import { generateJournalingPostedConfig } from "@/src/models/hume/configs/journaling";
import { generateGrowthPostedConfig } from "@/src/models/hume/configs/growth";
import { generateGratitudePostedConfig } from "@/src/models/hume/configs/gratitude";
import { generateCreativityPostedConfig } from "@/src/models/hume/configs/creativity";
import { generateProblemSolvingPostedConfig } from "@/src/models/hume/configs/solutions";

export const baseVoice: PostedVoice = {
  name: 'KORA',
  provider: 'HUME_AI',
}

// TODO: This results in an error, maybe you aren't supposed to use this if using the system default evi2
export const baseLanguageModel: PostedLanguageModel = {
  modelProvider: 'CUSTOM_LANGUAGE_MODEL',
  modelResource: 'ellm',
}

export function generateHumeConfigForUserWithJournalEntries(user: User, journalEntries: JournalEntry[]): PostedConfig {
  const category = user.preferences.selectedConfig;
  
  switch (category) {
    case 'journaling':
      return generateJournalingPostedConfig(user, journalEntries);
    case 'dating':
      return generateDatingPostedConfig(user);
    case 'solutions':
      return generateProblemSolvingPostedConfig(user);
    case 'gratitude':
      return generateGratitudePostedConfig(user);
    case 'growth':
      return generateGrowthPostedConfig(user);
    case 'creativity':
      return generateCreativityPostedConfig(user);
  }

  throw new Error(`Unsupported category: ${category}`);
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
