import { SystemPrompt, systemPromptAsString } from "@/src/models/configs/config";
import { JOURNALING_FIRST_TIME_PROMPTS, JOURNALING_RETURNING_PROMPTS, JOURNALING_SYSTEM_PROMPT } from "@/src/models/configs/journaling";
import { DEFAULT_JOURNALING_HUME_CONFIG_ID } from "@/src/models/constants";
import { getHumeSystemPrompt, HumeConfigTemplate } from "@/src/models/configs/hume/hume.config";
import { JournalEntry } from "@/src/models/journal.entry";
import { User } from "@/src/models/user";
import { baseVoice } from "@/src/services/humeConfigService";
import { PostedConfig } from "hume/api/resources/empathicVoice";

export const JOURNALING_HUME_SYSTEM_PROMPT: SystemPrompt = getHumeSystemPrompt(JOURNALING_SYSTEM_PROMPT);

export const generateJournalingSystemPrompt = (journalEntries?: JournalEntry[]): string => {
  const systemPrompt: SystemPrompt = {
    ...JOURNALING_HUME_SYSTEM_PROMPT
  };

  if (journalEntries?.length) {
    systemPrompt.context = [
      "Here are summaries of the user's previous journal entries:",
      journalEntries.map(entry => entry.summary).join('\n')
    ];
  }

  return systemPromptAsString(systemPrompt);
}

export const generateJournalingPostedConfig = (user?: User, journalEntries?: JournalEntry[]): PostedConfig => {
  console.log('journaling config selected');
  const isFirstSession = !user || !user.journalEntries || user.journalEntries.length === 0;
  return {
    eviVersion: '2',
    name: `General Journal Config: ${user?.userId}`,
    versionDescription: 'General journal assistant configuration',
    prompt: {
      text: generateJournalingSystemPrompt(journalEntries),
    },
    voice: baseVoice,
    languageModel: {
      modelProvider: "OPEN_AI",
      modelResource: "gpt-4o-mini",
      temperature: 0.5,
    },
    ellmModel: { allowShortResponses: true },
    eventMessages: {
      onNewChat: {
        enabled: true,
        text: isFirstSession ? JOURNALING_FIRST_TIME_PROMPTS[0] : JOURNALING_RETURNING_PROMPTS[0],
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
};

export const JournalingConfig: HumeConfigTemplate = {
  defaultConfigId: DEFAULT_JOURNALING_HUME_CONFIG_ID,
  generateConfig: generateJournalingPostedConfig,
  firstTimePrompts: JOURNALING_FIRST_TIME_PROMPTS,
  returningPrompts: JOURNALING_RETURNING_PROMPTS,
};
