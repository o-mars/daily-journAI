import { PostedConfig } from "hume/api/resources/empathicVoice";
import { getHumeSystemPrompt, HumeConfigTemplate } from "@/src/models/configs/hume/hume.config";
import { baseVoice } from "@/src/services/humeConfigService";
import { User } from "@/src/models/user";
import { DEFAULT_GROWTH_HUME_CONFIG_ID } from "@/src/models/constants";
import { SystemPrompt, systemPromptAsString } from "@/src/models/configs/config";
import { GROWTH_FIRST_TIME_PROMPTS, GROWTH_RETURNING_PROMPTS, GROWTH_SYSTEM_PROMPT } from "@/src/models/configs/growth";

export const GROWTH_HUME_SYSTEM_PROMPT: SystemPrompt = getHumeSystemPrompt(GROWTH_SYSTEM_PROMPT);

export const generateGrowthPostedConfig = (user?: User): PostedConfig => {
  return {
    eviVersion: '2',
    name: `Growth Config: ${user?.userId}`,
    versionDescription: 'Personal growth reflection assistant configuration using GPT-4o-mini',
    prompt: {
      text: systemPromptAsString(GROWTH_HUME_SYSTEM_PROMPT),
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

export const GrowthConfig: HumeConfigTemplate = {
  defaultConfigId: DEFAULT_GROWTH_HUME_CONFIG_ID,
  generateConfig: generateGrowthPostedConfig,
  firstTimePrompts: GROWTH_FIRST_TIME_PROMPTS,
  returningPrompts: GROWTH_RETURNING_PROMPTS,
};
