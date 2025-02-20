"use client";

import { useHeader } from "@/src/contexts/HeaderContext";
import { useUser } from "@/src/contexts/UserContext";
import { CATEGORIES, ConfigCategory } from "@/src/models/categories.config";
import CategorySelector, { CategoryOption } from "@/src/components/CategorySelector";

interface HumeCategoryOption extends CategoryOption {
  configId: string;
}

interface HumeSelectorProps {
  onCategorySelect?: (category: ConfigCategory) => void;
  hideStartButton?: boolean;
  minimal?: boolean;
}

export default function HumeSelector({ 
  onCategorySelect,
  hideStartButton = false,
  minimal = false
}: HumeSelectorProps) {
  const { navigateToView } = useHeader();
  const { user } = useUser();

  const categories = [
    { ...CATEGORIES.journaling, configId: user?.preferences.humeConfigs?.journaling?.id ?? CATEGORIES.journaling.defaultConfigId } as HumeCategoryOption,
    { ...CATEGORIES.dating, configId: user?.preferences.humeConfigs?.dating?.id ?? CATEGORIES.dating.defaultConfigId } as HumeCategoryOption,
    { ...CATEGORIES.gratitude, configId: user?.preferences.humeConfigs?.gratitude?.id ?? CATEGORIES.gratitude.defaultConfigId } as HumeCategoryOption,
    { ...CATEGORIES.solutions, configId: user?.preferences.humeConfigs?.solutions?.id ?? CATEGORIES.solutions.defaultConfigId } as HumeCategoryOption,
  ];

  const handleStart = () => {
    const selectedConfig = categories.find(c => c.id === user?.preferences.selectedConfig)?.configId;
    if (selectedConfig) {
      navigateToView('session', { configId: selectedConfig });
    }
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