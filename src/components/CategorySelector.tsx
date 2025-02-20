import React, { useState, useEffect } from 'react';
import { ConfigCategory } from '@/src/models/categories.config';
import { useUser } from "@/src/contexts/UserContext";
import { User } from "@/src/models/user";

export interface CategoryOption {
  id: ConfigCategory;
  name: string;
  description: string;
  icon: string;
}

interface CategorySelectorProps {
  onCategorySelect?: (category: ConfigCategory) => void;
  selectedCategory?: ConfigCategory;
  hideStartButton?: boolean;
  minimal?: boolean;
  categories: CategoryOption[];
  onStart?: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelect,
  selectedCategory: propSelectedCategory,
  hideStartButton = false,
  minimal = false,
  categories,
  onStart
}) => {
  const { user, updateUser } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory>(
    propSelectedCategory ?? user?.preferences.selectedConfig ?? 'journaling'
  );
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
    const baseHeight = Math.min(180, (gridDimensions.height - 200) * 0.2);
    return Math.max(120, baseHeight);
  };

  const handleCategorySelect = async (categoryId: ConfigCategory) => {
    setSelectedCategory(categoryId);
    if (!user) return;
    
    const partialUser: Partial<User> = {
      preferences: {
        ...user.preferences,
        selectedConfig: categoryId
      }
    };
    await updateUser(partialUser);
    onCategorySelect?.(categoryId);
  };

  return (
    <div className={`flex flex-col ${minimal ? 'h-auto' : 'h-[calc(100svh-64px)]'}`}>
      <div className={`${minimal ? '' : 'flex-1 overflow-y-auto'} py-2 sm:py-4`}>
        <div>
          {!minimal && (
            <h2 className="text-base md:text-lg lg:text-xl font-semibold mb-4 sm:mb-6 text-white text-center">
              What would you like to explore today?
            </h2>
          )}
          <div className={`grid grid-cols-2 gap-3 sm:gap-5 px-2 sm:px-4 py-1 ${minimal ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
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
                    {category.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hideStartButton && onStart && (
        <div className="flex justify-center p-6 sm:p-8 bg-gradient-to-t from-black/50 to-transparent">
          <button
            onClick={onStart}
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-36 lg:h-36 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-lg"
          >
            <span className="text-white text-2xl">Start</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
