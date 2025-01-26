import { CreativityConfig } from "@/src/models/hume/configs/creativity";
import { DatingConfig } from "@/src/models/hume/configs/dating";
import { GratitudeConfig } from "@/src/models/hume/configs/gratitude";
import { GrowthConfig } from "@/src/models/hume/configs/growth";
import { JournalingConfig } from "@/src/models/hume/configs/journaling";
import { ProblemSolvingConfig } from "@/src/models/hume/configs/solutions";
import { JournalEntry } from "@/src/models/journal.entry";
import { User } from "@/src/models/user";
import { PostedConfig } from "hume/api/resources/empathicVoice";

export interface HumeConfigId {
  id: string;
  version?: number;
}

export interface HumeSystemPrompt {
  [key: string]: string[];
}

export function humeSystemPromptAsString(config: HumeSystemPrompt): string {
  return Object.entries(config)
    .map(([key, value]) => `<${key}>${value.join(' ')}</${key}>`)
    .join('\n');
}

export interface HumeConfigTemplate {
  defaultConfigId: string;
  generateConfig: (user: User, recentJournalEntries?: JournalEntry[]) => PostedConfig;
  firstTimePrompts: string[];
  returningPrompts: string[];
}

export type BaseConfigCategory = 
  | 'journaling' 
  | 'dating'
  | 'solutions'
  | 'gratitude'
  | 'growth'
  | 'creativity';

export type CustomConfigCategory = `custom${number}`;
export type ConfigCategory = BaseConfigCategory | CustomConfigCategory;

export const CONFIG_TEMPLATES: Record<ConfigCategory, HumeConfigTemplate> = {
  dating: DatingConfig,
  journaling: JournalingConfig,
  solutions: ProblemSolvingConfig,
  gratitude: GratitudeConfig,
  growth: GrowthConfig,
  creativity: CreativityConfig,
};
