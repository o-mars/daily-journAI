import { PostedConfig } from "hume/api/resources/empathicVoice";
import { getHumeSystemPrompt, HumeConfigTemplate } from "@/src/models/configs/hume/hume.config";
import { baseVoice } from "@/src/services/humeConfigService";
import { User } from "@/src/models/user";
import { DEFAULT_GRATITUDE_HUME_CONFIG_ID } from "@/src/models/constants";
import { SystemPrompt, systemPromptAsString } from "@/src/models/configs/config";
import { GRATITUDE_FIRST_TIME_PROMPTS, GRATITUDE_RETURNING_PROMPTS, GRATITUDE_SYSTEM_PROMPT } from "@/src/models/configs/gratitude";

export const GRATITUDE_HUME_SYSTEM_PROMPT: SystemPrompt = getHumeSystemPrompt(GRATITUDE_SYSTEM_PROMPT);

export const generateGratitudePostedConfig = (user?: User): PostedConfig => {
  return {
    eviVersion: '2',
    name: `Gratitude Config: ${user?.userId}`,
    versionDescription: 'Gratitude reflection assistant configuration using GPT-4o-mini',
    prompt: {
      text: systemPromptAsString(GRATITUDE_HUME_SYSTEM_PROMPT),
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

export const GratitudeConfig: HumeConfigTemplate = {
  defaultConfigId: DEFAULT_GRATITUDE_HUME_CONFIG_ID,
  generateConfig: generateGratitudePostedConfig,
  firstTimePrompts: GRATITUDE_FIRST_TIME_PROMPTS,
  returningPrompts: GRATITUDE_RETURNING_PROMPTS,
};