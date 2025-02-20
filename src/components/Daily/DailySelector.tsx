"use client";

import { ConfigCategory } from "@/src/models/categories.config";
import CategorySelector from "@/src/components/CategorySelector";

interface DailySelectorProps {
  onCategorySelect?: (category: ConfigCategory) => void;
  hideStartButton?: boolean;
  minimal?: boolean;
  onStart?: () => void;
}

export default function DailySelector({
  onCategorySelect,
  hideStartButton = false,
  minimal = false,
  onStart
}: DailySelectorProps) {

  const categories = [
    {
      id: 'journaling' as ConfigCategory,
      name: 'Journaling',
      description: 'Reflect on your thoughts, feelings, and experiences',
      icon: '📝',
    },
    {
      id: 'dating' as ConfigCategory,
      name: 'Dating',
      description: 'Gain deeper insights into your relationships',
      icon: '💝',
    },
    {
      id: 'gratitude' as ConfigCategory,
      name: 'Gratitude',
      description: 'Focus on daily joys and moments of appreciation',
      icon: '✨',
    },
    {
      id: 'solutions' as ConfigCategory,
      name: 'Problem Solving',
      description: 'Talk through your problems to arrive at a solution',
      icon: '🎯',
    },
  ];

  const handleStart = () => {
    onStart?.();
  };

  return (
    <CategorySelector
      onCategorySelect={onCategorySelect}
      categories={categories}
      minimal={minimal}
      hideStartButton={hideStartButton}
      onStart={handleStart}
    />
  );
} 