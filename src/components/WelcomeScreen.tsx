import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/firebase.config";

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAgreeAndContinue = async () => {
    try {
      await signInAnonymously(auth);
      router.push('/main');
    } catch (e) {
      setError("Failed to sign in or connect. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 style={{ marginBottom: '32px' }} className="text-3xl font-bold">Welcome to JournAI</h1>
      
      <p className="mb-4 text-center">
        JournAI is your personal journaling assistant.
      </p>
      
      <p className="mb-4 text-center">
        Feel free to talk about whatever is on your mind. Whether it's your daily experiences, thoughts, or emotions, JournAI is here to listen and help you reflect.
      </p>
      
      <div className="bg-yellow-800 p-4 rounded-lg mb-4">
        <p className="text-center font-semibold">
          Please note: While the product is in testing, transcripts of your conversations may be reviewed by humans.
        </p>
      </div>
      
      <p className="mb-4 text-center">
        By continuing to use this app, you are consenting to this review.
      </p>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <button
        style={{ marginTop: '32px' }}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleAgreeAndContinue}
      >
        I Agree & Continue
      </button>
    </div>
  );
};

export default WelcomeScreen; 