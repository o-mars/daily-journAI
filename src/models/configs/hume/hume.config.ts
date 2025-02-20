import { JournalEntry } from "@/src/models/journal.entry";
import { User } from "@/src/models/user";
import { PostedConfig } from "hume/api/resources/empathicVoice";
import { ConfigCategory } from "@/src/models/categories.config";
import { SystemPrompt } from "@/src/models/configs/config";
import { DatingConfig } from "@/src/models/configs/hume/dating";
import { JournalingConfig } from "@/src/models/configs/hume/journaling";
import { GratitudeConfig } from "@/src/models/configs/hume/gratitude";
import { ProblemSolvingConfig } from "@/src/models/configs/hume/solutions";
import { GrowthConfig } from "@/src/models/configs/hume/growth";
import { CreativityConfig } from "@/src/models/configs/hume/creativity";
export interface HumeConfigId {
  id: string;
  version?: number;
}

export interface HumeConfigTemplate {
  defaultConfigId: string;
  generateConfig: (user: User, recentJournalEntries?: JournalEntry[]) => PostedConfig;
  firstTimePrompts: string[];
  returningPrompts: string[];
}

export function getHumeSystemPrompt(config: SystemPrompt): SystemPrompt {
  return {
    ...config,
    respond_to_expressions: [
      "If responding to the user, carefully read the user's message and analyze the top 3 emotional expressions provided in brackets.",
      "These expressions indicate the user's tone, and will be in the format: {intensity1 emotion1, intensity2 emotion2, ...}",
      "Identify the primary expressions, and consider their intensities.",
      "Match your response tone to the emotional context while maintaining analytical focus."
    ]
  };
}

export const CONFIG_TEMPLATES: Record<ConfigCategory, HumeConfigTemplate> = {
  dating: DatingConfig,
  journaling: JournalingConfig,
  solutions: ProblemSolvingConfig,
  gratitude: GratitudeConfig,
  growth: GrowthConfig,
  creativity: CreativityConfig,
};
