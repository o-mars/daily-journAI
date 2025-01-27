import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithNewAnonymousUser } from "@/src/services/authService";
import { useHeader } from "@/src/contexts/HeaderContext";
import HumeSelector from "@/src/components/Hume/HumeSelector";
import { CONFIG_TEMPLATES, ConfigCategory } from "@/src/models/hume.config";
import { useUser } from "@/src/contexts/UserContext";

const shouldShowPrivacyPolicy = false;

interface WelcomeScreenProps {
  preSelectedCategory?: ConfigCategory;
  showCategorySelector?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  preSelectedCategory = 'journaling',
  showCategorySelector = true 
}) => {
  const { branding } = useHeader();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [acceptedPolicy] = useState(!shouldShowPrivacyPolicy);
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory>(preSelectedCategory);
  const { setUser } = useUser();

  const handleAgreeAndContinue = async () => {
    try {
      const { user } = await signInWithNewAnonymousUser(selectedCategory);
      setUser(user);
      await new Promise(resolve => setTimeout(resolve, 0));
      const categoryConfig = CONFIG_TEMPLATES[selectedCategory];
      router.push(`/session?configId=${categoryConfig.defaultConfigId}`);
    } catch (e) {
      setError("Failed to sign in or connect. Please try again." + e);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex-1 min-h-[2vh]" />

      <div className="flex flex-col items-center justify-between flex-1 max-h-[96vh] w-full">
        <div className="text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center">
            Welcome to {branding.appName}
          </h1>
        </div>

        <div className="text-center space-y-2 xs:space-y-4">
          <p className="text-sm xs:text-base">
            Providing you a safe and supportive space for your thoughts.
          </p>
          <p className="text-sm xs:text-base">
            {branding.appWelcomeMessage}
          </p>
          {!shouldShowPrivacyPolicy && (
            <p className="text-sm xs:text-base text-gray-300">
              Your data is stored securely and only accessible to you.
            </p>
          )}
        </div>

        {showCategorySelector && (
          <div className="w-full max-w-md">
            <HumeSelector 
              onCategorySelect={setSelectedCategory}
              hideStartButton={true}
              minimal={true}
            />
          </div>
        )}

        <div className="text-center">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <button
            style={{ 
              border: '2px solid #3b82f6',
              backgroundColor: '#1d4ed8',
              padding: '12px 24px',
              borderRadius: '9999px'
            }}
            className={`text-white font-bold text-lg transition duration-300 ease-in-out transform 
              ${acceptedPolicy 
                ? 'hover:scale-105 hover:bg-blue-800 hover:border-blue-400' 
                : 'opacity-50 cursor-not-allowed'}`}
            onClick={handleAgreeAndContinue}
            disabled={!acceptedPolicy}
          >
            Start
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[2vh]" />
    </div>
  );
};

export default WelcomeScreen; 