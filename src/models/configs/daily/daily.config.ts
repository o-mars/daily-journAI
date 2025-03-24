import { ConfigCategory } from "@/src/models/categories.config";
import { SystemPrompt } from "@/src/models/configs/config";
import { CREATIVITY_FIRST_TIME_PROMPTS, CREATIVITY_RETURNING_PROMPTS, CREATIVITY_SYSTEM_PROMPT } from "@/src/models/configs/creativity";
import { DATING_FIRST_TIME_PROMPTS, DATING_RETURNING_PROMPTS, DATING_SYSTEM_PROMPT } from "@/src/models/configs/dating";
import { GRATITUDE_FIRST_TIME_PROMPTS, GRATITUDE_RETURNING_PROMPTS, GRATITUDE_SYSTEM_PROMPT } from "@/src/models/configs/gratitude";
import { GROWTH_FIRST_TIME_PROMPTS, GROWTH_RETURNING_PROMPTS, GROWTH_SYSTEM_PROMPT } from "@/src/models/configs/growth";
import { JOURNALING_FIRST_TIME_PROMPTS, JOURNALING_RETURNING_PROMPTS, JOURNALING_SYSTEM_PROMPT } from "@/src/models/configs/journaling";
import { PROBLEM_SOLVING_FIRST_TIME_PROMPTS, PROBLEM_SOLVING_RETURNING_PROMPTS, PROBLEM_SOLVING_SYSTEM_PROMPT } from "@/src/models/configs/solutions";
import { generateSystemMessageForAlternateLanguage, LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS, LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS } from "@/src/models/prompts";
import { User } from "@/src/models/user";

export function getDailySystemPrompt(config: SystemPrompt): SystemPrompt {
  return {
    ...config,
    wrapping_up_conversation: [
      LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS
    ]
  };
}

function getBasePromptForCategory(category: ConfigCategory): SystemPrompt {
  switch (category) {
    case 'journaling':
      return JOURNALING_SYSTEM_PROMPT;
    case 'gratitude':
      return GRATITUDE_SYSTEM_PROMPT;
    case 'growth':
      return GROWTH_SYSTEM_PROMPT;
    case 'solutions':
      return PROBLEM_SOLVING_SYSTEM_PROMPT;
    case 'dating':
      return DATING_SYSTEM_PROMPT;
    case 'creativity':
      return CREATIVITY_SYSTEM_PROMPT;
    default:
      return JOURNALING_SYSTEM_PROMPT;
  }
}

export function getFirstMessageForCategory(category: ConfigCategory, isNewUser: boolean): string[] {
  switch (category) {
    case 'journaling':
      return isNewUser ? JOURNALING_FIRST_TIME_PROMPTS : JOURNALING_RETURNING_PROMPTS;
    case 'gratitude':
      return isNewUser ? GRATITUDE_FIRST_TIME_PROMPTS : GRATITUDE_RETURNING_PROMPTS;
    case 'growth':
      return isNewUser ? GROWTH_FIRST_TIME_PROMPTS : GROWTH_RETURNING_PROMPTS;
    case 'solutions':
      return isNewUser ? PROBLEM_SOLVING_FIRST_TIME_PROMPTS : PROBLEM_SOLVING_RETURNING_PROMPTS;
    case 'dating':
      return isNewUser ? DATING_FIRST_TIME_PROMPTS : DATING_RETURNING_PROMPTS;
    case 'creativity':
      return isNewUser ? CREATIVITY_FIRST_TIME_PROMPTS : CREATIVITY_RETURNING_PROMPTS;
    default:
      return JOURNALING_FIRST_TIME_PROMPTS;
  }
}

export function getDailySystemPromptForCategory(user: User): SystemPrompt {
  const category = user.preferences.selectedConfig;
  const prompt = getBasePromptForCategory(category);
  const isNewUser = user.isNewUser;
  const firstMessage = getFirstMessageForCategory(category, isNewUser);
  const languageId = user.preferences.botPreferences['inner-echo'].languageId;
  return {
    ...prompt,
    
    ...(languageId !== 'en' ? { language: [generateSystemMessageForAlternateLanguage(languageId)] } : {}),
    
    wrapping_up_conversation: [
      LLM_SYSTEM_PROMPT_DISCONNECT_WITH_PROMPT_INSTRUCTIONS
    ],

    introduction: firstMessage,
    // wait_for_initial_user_response: [
    //   'Do not speak until the user has sent their first message.'
    // ],

    input_output_context: [
      LLM_SYSTEM_PROMPT_EXPECT_AUDIO_INSTRUCTIONS,
    ]
  }
}
