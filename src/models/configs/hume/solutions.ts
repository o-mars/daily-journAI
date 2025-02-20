import { PostedConfig } from "hume/api/resources/empathicVoice";
import { getHumeSystemPrompt, HumeConfigTemplate } from "@/src/models/configs/hume/hume.config";
import { baseVoice } from "@/src/services/humeConfigService";
import { User } from "@/src/models/user";
import { DEFAULT_SOLUTIONS_HUME_CONFIG_ID } from "@/src/models/constants";
import { SystemPrompt, systemPromptAsString } from "@/src/models/configs/config";
import { PROBLEM_SOLVING_FIRST_TIME_PROMPTS, PROBLEM_SOLVING_RETURNING_PROMPTS, PROBLEM_SOLVING_SYSTEM_PROMPT } from "@/src/models/configs/solutions";

export const PROBLEM_SOLVING_HUME_SYSTEM_PROMPT: SystemPrompt = getHumeSystemPrompt(PROBLEM_SOLVING_SYSTEM_PROMPT);

export const generateProblemSolvingPostedConfig = (user?: User): PostedConfig => {
  return {
    eviVersion: '2',
    name: `Problem-Solving Config: ${user?.userId}`,
    versionDescription: 'Problem-solving assistant configuration using GPT-4o-mini',
    prompt: {
      text: systemPromptAsString(PROBLEM_SOLVING_HUME_SYSTEM_PROMPT),
    },
    voice: baseVoice,
    languageModel: {
      modelProvider: "OPEN_AI",
      modelResource: "gpt-4o-mini",
      temperature: 0.4,
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

export const ProblemSolvingConfig: HumeConfigTemplate = {
  defaultConfigId: DEFAULT_SOLUTIONS_HUME_CONFIG_ID,
  generateConfig: generateProblemSolvingPostedConfig,
  firstTimePrompts: PROBLEM_SOLVING_FIRST_TIME_PROMPTS,
  returningPrompts: PROBLEM_SOLVING_RETURNING_PROMPTS,
};