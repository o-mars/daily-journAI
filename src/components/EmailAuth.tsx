import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User } from "firebase/auth";
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';
import { CHECK_EMAIL_MESSAGE, EMAIL_STORAGE_KEY } from '@/src/models/constants';
import { isValidEmail, sendMagicLink } from '@/src/services/authService';

interface EmailAuthProps {
  firebaseUser: User | null;
}

export default function EmailAuth({
  firebaseUser,
}: EmailAuthProps) {
  const [email, setEmail] = useState('');
  const statusRef = useRef<StatusIndicatorHandle>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSendMagicLink = useCallback(async () => {
    await sendMagicLink(email, firebaseUser?.uid);
    statusRef.current?.pushMessage({ type: 'info', text: CHECK_EMAIL_MESSAGE });
  }, [email, firebaseUser, statusRef]);

  const handleAuth = useCallback(async () => {
    if (!isValidEmail(email)) {
      statusRef.current?.pushMessage({ type: 'error', text: "Please enter a valid email address" });
      return;
    }

    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, email);
      await handleSendMagicLink();
    } catch (error) {
      console.error("Auth error:", error);
      statusRef.current?.pushMessage({ type: 'error', text: `Authentication failed: ${(error as Error).message}` });
    }
  }, [email, handleSendMagicLink, statusRef]);

  const isFormValid = useMemo(() => {
    return isValidEmail(email);
  }, [email]);

  return (
    <div className="relative flex flex-col">
      <div className="flex-1">
        <div className="pt-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white px-4 py-2"
            placeholder="you@example.com"
          />
        </div>

        <button
          onClick={handleAuth}
          className="w-full flex justify-center mt-8 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={!isFormValid}
        >
          Connect Email
        </button>

        <div className="mt-6 min-h-[20px]">
        <StatusIndicator ref={statusRef} />
        </div>
      </div>
    </div>
  );
} 