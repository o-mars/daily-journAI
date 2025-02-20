import { DEFAULT_CREATIVITY_HUME_CONFIG_ID, DEFAULT_DATING_HUME_CONFIG_ID, DEFAULT_GRATITUDE_HUME_CONFIG_ID, DEFAULT_GROWTH_HUME_CONFIG_ID } from "@/src/models/constants";

import { DEFAULT_SOLUTIONS_HUME_CONFIG_ID } from "@/src/models/constants";

import { DEFAULT_JOURNALING_HUME_CONFIG_ID } from "@/src/models/constants";

export type BaseConfigCategory = 
  | 'journaling' 
  | 'dating'
  | 'solutions'
  | 'gratitude'
  | 'growth'
  | 'creativity';

export type CustomConfigCategory = `custom${number}`;
export type ConfigCategory = BaseConfigCategory | CustomConfigCategory;

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultConfigId: string;
}

export const CATEGORIES: Record<ConfigCategory, CategoryConfig> = {
  journaling: {
    id: 'journaling' as ConfigCategory,
    name: 'Journaling',
    description: 'Reflect on your thoughts, feelings, and experiences',
    icon: '📝',
    defaultConfigId: DEFAULT_JOURNALING_HUME_CONFIG_ID,
  },
  dating: {
    id: 'dating',
    name: 'Dating',
    description: 'Reflect on your relationships and dating life',
    icon: '💝',
    defaultConfigId: DEFAULT_DATING_HUME_CONFIG_ID,
  },
  solutions: {
    id: 'solutions',
    name: 'Problem Solving',
    description: 'Talk through your problems to arrive at a solution',
    icon: '🎯',
    defaultConfigId: DEFAULT_SOLUTIONS_HUME_CONFIG_ID,
  },
  gratitude: {
    id: 'gratitude',
    name: 'Gratitude',
    description: 'Focus on daily joys and moments of appreciation',
    icon: '✨',
    defaultConfigId: DEFAULT_GRATITUDE_HUME_CONFIG_ID,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Reflect on your personal growth and development',
    icon: '🌱',
    defaultConfigId: DEFAULT_GROWTH_HUME_CONFIG_ID,
  },
  creativity: {
    id: 'creativity',
    name: 'Creativity',
    description: 'Explore your creative side and generate ideas',
    icon: '🎨',
    defaultConfigId: DEFAULT_CREATIVITY_HUME_CONFIG_ID,
  }
  // ... add other categories
}; 