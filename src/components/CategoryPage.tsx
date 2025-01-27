"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/contexts/UserContext";
import WelcomeScreen from "@/src/components/WelcomeScreen";
import { ConfigCategory } from "@/src/models/hume.config";
import { User } from "@/src/models/user";

interface CategoryPageProps {
  category: ConfigCategory;
  configId: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category, configId }) => {
  const { user, isInitialized, updateUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initCategory = async () => {
      if (!isInitialized || !user) return;
      
      if (user.preferences.selectedConfig !== category) {
        const partialUser: Partial<User> = {
          preferences: {
            ...user.preferences,
            selectedConfig: category,
          },
        };
        await updateUser(partialUser);
      }
      
      if (mounted) {
        router.push(`/session?configId=${configId}`);
      }
    };

    void initCategory();

    return () => {
      mounted = false;
    };
  }, [user, isInitialized, updateUser, router, category, configId]);

  if (!isInitialized || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      </div>
    );
  }

  return (
    <WelcomeScreen 
      preSelectedCategory={category}
      showCategorySelector={false}
    />
  );
};

export default CategoryPage; 