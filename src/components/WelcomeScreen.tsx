import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithNewAnonymousUser } from "@/src/services/authService";
import { useHeader } from "@/src/contexts/HeaderContext";

const shouldShowPrivacyPolicy = false;

const WelcomeScreen: React.FC = () => {
  const { branding } = useHeader();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(!shouldShowPrivacyPolicy);

  const handleAgreeAndContinue = async () => {
    try {
      await signInWithNewAnonymousUser();
      router.push('/start?autoConnect=true');
    } catch (e) {
      setError("Failed to sign in or connect. Please try again." + e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 style={{ marginBottom: '32px' }} className="text-3xl font-bold">
        <span className="xs:inline block text-center">Welcome to</span>{' '}
        <span className="xs:inline block text-center mt-2 xs:mt-0">{branding.appName}</span>
      </h1>

      <p style={{ marginTop: '16px' }} className="mb-4 text-center">
        Providing you a safe and supportive space for your thoughts.
      </p>
      <p className="mb-4 text-center">
        {branding.appWelcomeMessage}
      </p>
      
      {shouldShowPrivacyPolicy ? (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="privacy-checkbox"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="privacy-checkbox">
            I confirm that I have read and agreed to the{' '}
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  '/privacy-policy',
                  'Privacy Policy',
                  'width=700,height=250,left=200,top=200,menubar=no,toolbar=no,location=no,status=no'
                );
              }}
              className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Privacy Policy
            </a>
            {' '}
          </label>
        </div>
      ) : (
        <div className="text-center text-gray-300">
          <p>Your data is stored securely and only accessible to you.</p>
        </div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <button
        style={{ 
          marginTop: '32px',
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
  );
};

export default WelcomeScreen; 