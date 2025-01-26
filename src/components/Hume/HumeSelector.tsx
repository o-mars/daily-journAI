"use client";

import { useState } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { DEFAULT_CREATIVITY_HUME_CONFIG_ID, DEFAULT_DATING_HUME_CONFIG_ID, DEFAULT_GRATITUDE_HUME_CONFIG_ID, DEFAULT_GROWTH_HUME_CONFIG_ID, DEFAULT_JOURNALING_HUME_CONFIG_ID, DEFAULT_SOLUTIONS_HUME_CONFIG_ID } from "@/src/models/constants";
import { useHeader } from "@/src/contexts/HeaderContext";
import { User } from "@/src/models/user";
import { ConfigCategory } from "@/src/models/hume.config";

interface CategoryOption {
  id: ConfigCategory;
  title: string;
  description: string;
  icon: string;
  configId: string;
}

function CategoryGrid({ onSelect, selectedCategory, categories, minimal }: { 
  onSelect: (category: ConfigCategory) => void;
  selectedCategory: ConfigCategory;
  categories: CategoryOption[];
  minimal?: boolean;
}) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {!minimal && (
          <h2 className="hidden sm:block lg:block md:hidden text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-white text-center">
            What would you like to explore today?
          </h2>
        )}
        <div className={`grid grid-cols-2 gap-2 sm:gap-4 px-2 sm:px-4 ${minimal ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`
                group flex flex-col 
                ${minimal 
                  ? 'h-[80px] min-h-[80px] p-1 sm:p-2' 
                  : 'h-[calc(18vh-1.5rem)] sm:h-auto min-h-[120px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[180px] p-2 sm:p-4'
                }
                rounded-lg transition-all relative
                ${selectedCategory === category.id 
                  ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg scale-105' 
                  : 'bg-gray-800 hover:bg-gray-700'}
              `}
              title={category.description}
            >
              <div className="flex flex-col items-center justify-center w-full h-full gap-1 sm:gap-2">
                <span className={`${minimal 
                  ? 'text-[1.5rem] sm:text-[1.75rem]' 
                  : 'text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem]'
                } -mt-1`}>
                  {category.icon}
                </span>
                <h3 className={`${minimal 
                  ? 'text-[0.7rem] sm:text-[0.8rem]' 
                  : 'text-[0.9rem] sm:text-[1.1rem] md:text-[1.3rem] lg:text-[1.5rem]'
                } font-semibold text-white text-center w-full leading-tight`}>
                  {category.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {!minimal && (
        <div className="px-4 mt-4">
          {selectedCategory && (
            <p className="text-xs sm:text-base md:text-xl lg:text-2xl text-gray-300 text-center animate-fade-in">
              {categories.find(c => c.id === selectedCategory)?.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-in;
  }
`;

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
  const { user, updateUser } = useUser();
  const [selectedCategory, setSelectedCategory] = useState(
    user?.preferences.selectedConfig ?? 'journaling'
  );

  const categories: CategoryOption[] = [
    {
      id: 'journaling',
      title: 'General',
      description: 'Reflect on your thoughts, feelings, and experiences',
      icon: '📝',
      configId: user?.preferences.humeConfigs?.journaling?.id ?? DEFAULT_JOURNALING_HUME_CONFIG_ID,
    },
    {
      id: 'dating',
      title: 'Relationships',
      description: 'Gain deeper insights into your relationships',
      icon: '💝',
      configId: user?.preferences.humeConfigs?.dating?.id ?? DEFAULT_DATING_HUME_CONFIG_ID,
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      description: 'Explore your values, habits, and emotional patterns',
      icon: '🌱',
      configId: user?.preferences.humeConfigs?.growth?.id ?? DEFAULT_GROWTH_HUME_CONFIG_ID,
    },
    {
      id: 'gratitude',
      title: 'Gratitude',
      description: 'Focus on daily joys and moments of appreciation',
      icon: '✨',
      configId: user?.preferences.humeConfigs?.gratitude?.id ?? DEFAULT_GRATITUDE_HUME_CONFIG_ID,
    },
    {
      id: 'solutions',
      title: 'Problem Solving',
      description: 'Talk through your problems to arrive at a solution',
      icon: '🎯',
      configId: user?.preferences.humeConfigs?.solutions?.id ?? DEFAULT_SOLUTIONS_HUME_CONFIG_ID,
    },
    {
      id: 'creativity',
      title: 'Creativity',
      description: 'Explore ideas, stories, and artistic expression',
      icon: '🎨',
      configId: user?.preferences.humeConfigs?.creativity?.id ?? DEFAULT_CREATIVITY_HUME_CONFIG_ID,
    },
  ];

  const selectedConfig = categories.find(c => c.id === selectedCategory)?.configId;

  const handleCategorySelect = (categoryId: ConfigCategory) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
    if (!user) return;
    const partialUser: Partial<User> = {
      preferences: {
        ...user.preferences,
        selectedConfig: categoryId
      }
    }
    void updateUser(partialUser);
  };

  const handleStart = () => {
    if (selectedConfig) {
      navigateToView('session', { configId: selectedConfig });
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`flex flex-col ${minimal ? 'h-auto' : 'h-[calc(100svh-64px)]'}`}>
        <div className={`${minimal ? '' : 'flex-1 overflow-y-auto'} py-2 sm:py-4`}>
          <CategoryGrid
            onSelect={handleCategorySelect}
            selectedCategory={selectedCategory}
            categories={categories}
            minimal={minimal}
          />
        </div>
        {!hideStartButton && (
          <div className="flex justify-center p-6 sm:p-8 bg-gradient-to-t from-black/50 to-transparent">
            <button
              onClick={handleStart}
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-36 lg:h-36 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-2xl">Start</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
} 