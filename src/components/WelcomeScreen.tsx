import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/firebase.config";
import { useHeader } from "@/src/contexts/HeaderContext";

const WelcomeScreen: React.FC = () => {
  const { branding } = useHeader();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAgreeAndContinue = async () => {
    try {
      await signInAnonymously(auth);
      router.push('/main?autoConnect=true');
    } catch (e) {
      setError("Failed to sign in or connect. Please try again." + e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 style={{ marginBottom: '32px' }} className="text-3xl font-bold">Welcome to {branding.appName}</h1>

      <p style={{ marginTop: '16px' }} className="mb-4 text-center">
        Providing you a safe and supportive space for your thoughts.
      </p>
      <p className="mb-4 text-center">
        {branding.appWelcomeMessage}
      </p>
      
      <div style={{ marginTop: '24px' }} className="bg-red-900 p-4 rounded-lg mb-4">
        <p className="text-center font-semibold">
          Privacy Policy: All data is stored securely and protected from unauthorized access.
          <br />
          Your data is never shared, sold, or given to third parties under any circumstances.
          <br />
          Data might be accessed by our team in order to improve the user experience.
          <br />
          By proceeding, you are consenting to this policy.
        </p>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <button
        style={{ 
          marginTop: '32px',
          border: '2px solid #3b82f6',
          backgroundColor: '#1d4ed8',
          padding: '12px 24px',
          borderRadius: '9999px'
        }}
        className="text-white font-bold text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-800 hover:border-blue-400"
        onClick={handleAgreeAndContinue}
      >
        I Agree & Continue
      </button>
    </div>
  );
};

export default WelcomeScreen; 