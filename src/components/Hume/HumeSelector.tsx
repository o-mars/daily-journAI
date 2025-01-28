"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { DEFAULT_DATING_HUME_CONFIG_ID, DEFAULT_GRATITUDE_HUME_CONFIG_ID, DEFAULT_JOURNALING_HUME_CONFIG_ID, DEFAULT_SOLUTIONS_HUME_CONFIG_ID } from "@/src/models/constants";
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
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      setGridDimensions({ width: vw, height: vh });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getCardHeight = () => {
    if (minimal) return 80;
    
    const baseHeight = Math.min(
      180,
      (gridDimensions.height - 200) * 0.2
    );
    
    return Math.max(120, baseHeight);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {!minimal && (
          <h2 className="text-base md:text-lg lg:text-xl font-semibold mb-4 sm:mb-6 text-white text-center">
            What would you like to explore today?
          </h2>
        )}
        <div 
          className={`grid grid-cols-2 gap-3 sm:gap-5 px-2 sm:px-4 py-1 ${minimal ? 'max-w-md' : 'max-w-2xl'} mx-auto`}
          style={{
            maxHeight: minimal ? 'auto' : `calc(${gridDimensions.height}px - 200px)`,
            overflow: 'auto'
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`
                group flex flex-col 
                rounded-lg transition-all relative
                ${selectedCategory === category.id 
                  ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg scale-[1.02]'
                  : 'bg-gray-800/70 hover:bg-gray-700/80 opacity-75 hover:opacity-90'}
              `}
              style={{
                height: `${getCardHeight()}px`,
                padding: minimal ? '0.25rem 0.5rem' : '0.5rem 1rem'
              }}
              title={category.description}
            >
              <div className="flex flex-col items-center justify-center w-full h-full gap-1 sm:gap-2">
                <span style={{
                  fontSize: minimal 
                    ? 'clamp(1.5rem, 3vw, 1.75rem)'
                    : 'clamp(2rem, 4vw, 3.5rem)'
                }}>
                  {category.icon}
                </span>
                <h3 style={{
                  fontSize: minimal
                    ? 'clamp(0.7rem, 2vw, 0.8rem)'
                    : 'clamp(0.9rem, 2.5vw, 1.5rem)'
                }} 
                className="font-semibold text-white text-center w-full leading-tight">
                  {category.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {!minimal && (
        <div className="px-4 mt-4 sm:mt-6">
          {selectedCategory && (
            <p className="text-blue-200 text-center animate-fade-in font-medium"
               style={{
                 fontSize: `clamp(0.9rem, 2.2vw, 1.5rem)`
               }}>
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
      title: 'Journaling',
      description: 'Reflect on your thoughts, feelings, and experiences',
      icon: '📝',
      configId: user?.preferences.humeConfigs?.journaling?.id ?? DEFAULT_JOURNALING_HUME_CONFIG_ID,
    },
    {
      id: 'dating',
      title: 'Dating',
      description: 'Gain deeper insights into your relationships',
      icon: '💝',
      configId: user?.preferences.humeConfigs?.dating?.id ?? DEFAULT_DATING_HUME_CONFIG_ID,
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