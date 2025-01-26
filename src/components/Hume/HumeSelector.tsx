"use client";

import { useState } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { DEFAULT_DATING_HUME_CONFIG_ID, DEFAULT_JOURNALING_HUME_CONFIG_ID } from "@/src/models/constants";
import { useHeader } from "@/src/contexts/HeaderContext";
import { User } from "@/src/models/user";

interface CategoryOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  configId: string;
}

function CategoryGrid({ onSelect, selectedCategory, categories }: { 
  onSelect: (category: string) => void;
  selectedCategory: string;
  categories: CategoryOption[];
}) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-6 text-white text-center">What would you like to explore today?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 max-w-2xl mx-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              p-6 rounded-lg text-left transition-all
              ${selectedCategory === category.id 
                ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg scale-105' 
                : 'bg-gray-800 hover:bg-gray-700'}
            `}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
            <p className="text-sm text-gray-300">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HumeSelector() {
  const { navigateToView } = useHeader();
  const { user, updateUser } = useUser();
  const [selectedCategory, setSelectedCategory] = useState(
    user?.preferences.selectedConfig ?? 'journaling'
  );

  const categories = [
    {
      id: 'journaling',
      title: 'General Journaling',
      description: 'Reflect on your thoughts, feelings, and daily experiences',
      icon: '📝',
      configId: user?.preferences.humeConfigs?.journaling?.id ?? DEFAULT_JOURNALING_HUME_CONFIG_ID,
    },
    {
      id: 'dating',
      title: 'Dating & Relationships',
      description: 'Build mindfulness around your connections and relationship experiences',
      icon: '💝',
      configId: user?.preferences.humeConfigs?.dating?.id ?? DEFAULT_DATING_HUME_CONFIG_ID,
    },
  ];

  const selectedConfig = categories.find(c => c.id === selectedCategory)?.configId;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
    <div className="flex flex-col h-[calc(100svh-64px)]">
      <div className="flex-1 overflow-y-auto py-8">
        <CategoryGrid
          onSelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          categories={categories}
        />
      </div>
      <div className="flex justify-center p-8 bg-gradient-to-t from-black/50 to-transparent">
        <button
          onClick={handleStart}
          className="w-32 h-32 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-2xl">Start</span>
        </button>
      </div>
    </div>
  );
} 