import { PostedConfig } from "hume/api/resources/empathicVoice";
import { getHumeSystemPrompt, HumeConfigTemplate } from "@/src/models/configs/hume/hume.config";
import { baseVoice } from "@/src/services/humeConfigService";
import { User } from "@/src/models/user";
import { DEFAULT_DATING_HUME_CONFIG_ID } from "@/src/models/constants";
import { SystemPrompt, systemPromptAsString } from "@/src/models/configs/config";
import { DATING_FIRST_TIME_PROMPTS, DATING_RETURNING_PROMPTS, DATING_SYSTEM_PROMPT } from "@/src/models/configs/dating";

export const DATING_HUME_SYSTEM_PROMPT: SystemPrompt = getHumeSystemPrompt(DATING_SYSTEM_PROMPT);

export const generateDatingPostedConfig = (user?: User): PostedConfig => {
  console.info("ignore", user);
  // const isFirstSession = !user || !user.journalEntries || user.journalEntries.length === 0 || true;
  return {
    eviVersion: '2',
    name: `Dating Config: ${user?.userId}`,
    versionDescription: 'Dating reflection assistant configuration using GPT-4o-mini',
    prompt: {
      text: systemPromptAsString(DATING_HUME_SYSTEM_PROMPT),
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
        enabled: false,
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

export const DatingConfig: HumeConfigTemplate = {
  defaultConfigId: DEFAULT_DATING_HUME_CONFIG_ID,
  generateConfig: generateDatingPostedConfig,
  firstTimePrompts: DATING_FIRST_TIME_PROMPTS,
  returningPrompts: DATING_RETURNING_PROMPTS,
};
