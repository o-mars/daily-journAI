import { PostedConfig } from "hume/api/resources/empathicVoice";
import { getHumeSystemPrompt, HumeConfigTemplate } from "@/src/models/configs/hume/hume.config";
import { baseVoice } from "@/src/services/humeConfigService";
import { User } from "@/src/models/user";
import { DEFAULT_CREATIVITY_HUME_CONFIG_ID } from "@/src/models/constants";
import { SystemPrompt, systemPromptAsString } from "@/src/models/configs/config";
import { CREATIVITY_FIRST_TIME_PROMPTS, CREATIVITY_RETURNING_PROMPTS, CREATIVITY_SYSTEM_PROMPT } from "@/src/models/configs/creativity";

export const CREATIVITY_HUME_SYSTEM_PROMPT: SystemPrompt = getHumeSystemPrompt(CREATIVITY_SYSTEM_PROMPT);

export const generateCreativityPostedConfig = (user?: User): PostedConfig => {
  return {
    eviVersion: '2',
    name: `Creativity Config: ${user?.userId}`,
    versionDescription: 'Creativity exploration assistant configuration using GPT-4o-mini',
    prompt: {
      text: systemPromptAsString(CREATIVITY_HUME_SYSTEM_PROMPT),
    },
    voice: baseVoice,
    languageModel: {
      modelProvider: "OPEN_AI",
      modelResource: "gpt-4o-mini",
      temperature: 0.7, // Slightly higher temperature for more creative responses
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

export const CreativityConfig: HumeConfigTemplate = {
  defaultConfigId: DEFAULT_CREATIVITY_HUME_CONFIG_ID,
  generateConfig: generateCreativityPostedConfig,
  firstTimePrompts: CREATIVITY_FIRST_TIME_PROMPTS,
  returningPrompts: CREATIVITY_RETURNING_PROMPTS,
};