import React, { useState, useEffect } from "react";
import { signInWithNewAnonymousUser } from "@/src/services/authService";
import { useHeader } from "@/src/contexts/HeaderContext";
import { ConfigCategory } from "@/src/models/categories.config";
import { useUser } from "@/src/contexts/UserContext";
import HumeSelector from "@/src/components/Hume/HumeSelector";
import DailySelector from "@/src/components/Daily/DailySelector";
import { CONFIG_TEMPLATES } from "@/src/models/configs/hume/hume.config";

const shouldShowPrivacyPolicy = false;

interface WelcomeScreenProps {
  preSelectedCategory?: ConfigCategory;
  showCategorySelector?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  preSelectedCategory = 'journaling',
  showCategorySelector = true 
}) => {
  const { branding, navigateToView } = useHeader();
  const [error, setError] = useState<string | null>(null);
  const [acceptedPolicy] = useState(!shouldShowPrivacyPolicy);
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory>(preSelectedCategory);
  const { clientProvider, isInitialized, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && user) {
      if (clientProvider === 'dailybots') {
        navigateToView('main', { autoConnect: 'true' });
      } else {
        const categoryConfig = CONFIG_TEMPLATES[selectedCategory];
        navigateToView('session', { configId: categoryConfig.defaultConfigId });
      }
    }
  }, [isInitialized, user, clientProvider, selectedCategory, navigateToView]);

  const handleAgreeAndContinue = async () => {
    try {
      setIsLoading(true);
      await signInWithNewAnonymousUser(selectedCategory);
    } catch (e) {
      setError("Failed to sign in or connect. Please try again." + e);
      setIsLoading(false);
    }
  };

  const Selector = clientProvider === 'dailybots' ? DailySelector : HumeSelector;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-primary p-4">
      <div className="flex-1 min-h-[2vh]" />

      <div className="flex flex-col items-center justify-between flex-1 max-h-[96vh] w-full">
        <div className="text-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center">
            Welcome to {branding.appName}
          </h1>
        </div>

        {!isLoading ? (
          <>
            <div className="text-center space-y-2 xs:space-y-4">
              <p className="text-sm xs:text-base">
                Providing you a safe and supportive space for your thoughts.
              </p>
              <p className="text-sm xs:text-base">
                {branding.appWelcomeMessage}
              </p>
              {!shouldShowPrivacyPolicy && (
                <div className="relative inline-flex items-center group">
                  <p className="text-sm xs:text-base text-tertiary">
                    Your data is stored securely and only accessible to you
                  </p>
                  <button 
                    className="ml-2 w-5 h-5 rounded-full bg-surface-2 text-tertiary flex items-center justify-center text-sm 
                             hover:bg-surface-3 hover:text-primary transition-colors"
                    onClick={() => window.open('/privacy-policy', '_blank')}
                  >
                    ?
                  </button>
                </div>
              )}
            </div>

            {showCategorySelector && (
              <div className="w-full max-w-md">
                <Selector
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
                  padding: '12px 24px',
                  borderRadius: '9999px'
                }}
                className={`text-content-white font-bold text-lg transition duration-300 ease-in-out transform 
                  ${acceptedPolicy 
                    ? 'bg-accent-primary border-2 border-accent-primary hover:scale-105 hover:bg-accent-primary-hover hover:border-accent-primary'
                    : 'opacity-50 cursor-not-allowed'}`}
                onClick={handleAgreeAndContinue}
                disabled={!acceptedPolicy}
              >
                Start
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-tertiary">Setting up your session...</p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[2vh]" />
    </div>
  );
};

export default WelcomeScreen;
