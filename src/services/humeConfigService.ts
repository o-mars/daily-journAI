import { PostedLanguageModel, PostedVoice } from "hume/api/resources/empathicVoice";
import { PostedConfig } from "hume/api/resources/empathicVoice/resources/configs/client";
import { defaultHumeSystemPrompt, generateHumeSystemPromptForUser, generateHumeSystemPromptForUserWithJournalEntries, HumeSystemPrompt, humeSystemPromptAsString } from "@/src/models/hume.config";
import { User } from "@/src/models/user";
import { JournalEntry } from "@/src/models/journal.entry";
import { HUME_FIRST_TIME_MESSAGE, HUME_RETURNING_FIRST_MESSAGE } from "@/src/models/prompts";

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