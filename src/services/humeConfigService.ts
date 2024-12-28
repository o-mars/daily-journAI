import { PostedLanguageModel, PostedVoice } from "hume/api/resources/empathicVoice";
import { PostedConfig } from "hume/api/resources/empathicVoice/resources/configs/client";
import { defaultHumeSystemPrompt, generateHumeSystemPromptForUser, generateHumeSystemPromptForUserWithJournalEntries, HumeSystemPrompt, humeSystemPromptAsString } from "@/src/models/hume.config";
import { User } from "@/src/models/user";
import { JournalEntry } from "@/src/models/journal.entry";

export const baseVoice: PostedVoice = {
  name: 'KORA',
  provider: 'HUME_AI',
}

// TODO: Is this correct or should this be blank, since we're using native EVI2?
export const baseLanguageModel: PostedLanguageModel = {
  modelProvider: 'CUSTOM_LANGUAGE_MODEL',
  modelResource: 'ellm',
}

export function generateHumeConfigForUser(user: User): PostedConfig {
  const humeSystemPrompt: HumeSystemPrompt = generateHumeSystemPromptForUser(user);
  return generateHumeConfigWithPrompt(humeSystemPrompt);
}

export function generateHumeConfigForUserWithJournalEntries(user: User, journalEntries: JournalEntry[]): PostedConfig {
  const humeSystemPrompt: HumeSystemPrompt = generateHumeSystemPromptForUserWithJournalEntries(user, journalEntries);
  return generateHumeConfigWithPrompt(humeSystemPrompt);
}

export const baseHumeConfig: PostedConfig = generateHumeConfigWithPrompt(defaultHumeSystemPrompt);

export function generateHumeConfigWithPrompt(prompt: HumeSystemPrompt): PostedConfig {
  const humeConfig: PostedConfig = {
    eviVersion: '2',
    name: 'Journaling Assistant Config',
    versionDescription: 'Journaling assistant configuration',
    prompt: {
      text: humeSystemPromptAsString(prompt),
    },
    voice: baseVoice,
    languageModel: baseLanguageModel,
    ellmModel: { allowShortResponses: true },
    eventMessages: {
      onNewChat: {
        enabled: true,
        text: `Hi! I'm Echo, and I'm here to help you reflect on your day. What's on your mind?`
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