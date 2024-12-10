import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { RecaptchaVerifier, PhoneAuthProvider } from 'firebase/auth';
import StatusIndicator, { StatusIndicatorHandle } from './StatusIndicator';
import { useUser } from '@/src/contexts/UserContext';
import { PHONE_STORAGE_KEY } from '@/src/models/constants';
import { auth } from '@/firebase.config';
import { errorMessages, linkPhoneCredential, signInWithPhone, validatePhoneNumber } from '@/src/services/authService';
import { FirebaseError } from 'firebase/app';

interface PhoneAuthProps {
  mode: 'signIn' | 'signUp' | 'link';
  onSuccess?: () => void;
  testMode?: boolean;
}

export default function PhoneAuth({ mode, onSuccess, testMode = false }: PhoneAuthProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<string | null>(null);
  const statusRef = useRef<StatusIndicatorHandle>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const { updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const verificationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPhone = localStorage.getItem(PHONE_STORAGE_KEY);
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
  }, []);

  useEffect(() => {
    if (confirmationResult) {
      verificationInputRef.current?.focus();
    } else {
      phoneInputRef.current?.focus();
    }
  }, [confirmationResult, phoneNumber, verificationCode]);

  const resetRecaptcha = useCallback(() => {
    if (recaptchaVerifier.current) {
      recaptchaVerifier.current.clear();
      recaptchaVerifier.current = null;
    }
  }, []);

  const initializeRecaptcha = useCallback(async () => {
    setShowRecaptcha(true);
    if (testMode) {
      auth.settings.appVerificationDisabledForTesting = true;
    }

    recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {
      },
      'expired-callback': () => {
        statusRef.current?.pushMessage({ 
          type: 'error', 
          text: 'reCAPTCHA expired. Please verify again.' 
        });
        resetRecaptcha();
      }
    });

    return recaptchaVerifier.current.render().then((widgetId) => {
      recaptchaWidgetId.current = widgetId;
    });
  }, [resetRecaptcha, testMode]);


  const handleSendCode = useCallback(async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      statusRef.current?.pushMessage({ 
        type: 'error', 
        text: 'Please enter a valid phone number (e.g., +12345678900)' 
      });
      return;
    }

    try {
      setIsLoading(true);

      if (!recaptchaVerifier.current) {
        await initializeRecaptcha();
      }

      if (!recaptchaVerifier.current) {
        throw new Error('reCAPTCHA not initialized');
      }

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      
      localStorage.setItem(PHONE_STORAGE_KEY, phoneNumber);

      setConfirmationResult(verificationId);
      statusRef.current?.pushMessage({ 
        type: 'info',
        text: `Please check ${phoneNumber} for the code.`
      });
    } catch (error) {
      console.error('Error sending code:', error);
      const errorMessage = errorMessages[(error as FirebaseError)?.code] || `Failed to send code: ${(error as Error).message}`;
      statusRef.current?.pushMessage({ type: 'error', text: errorMessage });
      if (Object.keys(errorMessages).includes((error as FirebaseError)?.code)) {
        setPhoneNumber('');
      }
      resetRecaptcha();
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, initializeRecaptcha, resetRecaptcha]);

  const handleVerifyCode = useCallback(async () => {
    if (!confirmationResult) return;

    try {
      setIsLoading(true);
      let user = auth.currentUser;

      if (mode === 'link') {
        if (!user) {
            throw new Error('No user is currently signed in');
        }
        await linkPhoneCredential(user, confirmationResult, verificationCode);
      } else {
        await signInWithPhone(confirmationResult, verificationCode);
        user = auth.currentUser;
      }

      if (user?.phoneNumber) {
        await updateUser({
          profile: {
            phone: user.phoneNumber,
            isAnonymous: false
          }
        });
      }

      statusRef.current?.pushMessage({ 
        type: 'success', 
        text: mode === 'link' ? 'Phone number added!' : 'Signed in successfully!'
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error verifying code:', error);
      const errorMessage = errorMessages[(error as FirebaseError)?.code] || `Failed to send code: ${(error as Error).message}`;
      statusRef.current?.pushMessage({ type: 'error', text: errorMessage });

      if (Object.keys(errorMessages).includes((error as FirebaseError)?.code)) {
        setPhoneNumber('');
      }
      resetRecaptcha();
      setVerificationCode('');

      if ((error as FirebaseError)?.code === 'auth/account-exists-with-different-credential') {
        setPhoneNumber('');
        setConfirmationResult(null);
        resetRecaptcha();
      }
    } finally {
      setIsLoading(false);
    }
  }, [confirmationResult, verificationCode, mode, onSuccess, updateUser, resetRecaptcha]);

  const isPhoneValid = useMemo(() => {
    return validatePhoneNumber(phoneNumber);
  }, [phoneNumber]);

  return (
    <div className="h-[240px] relative flex flex-col">
      <div className="flex-1">
        <div className="pt-6">
          <label htmlFor="phone-input" className="block text-sm font-medium text-gray-300">
            {confirmationResult ? 'Verification Code' : 'Phone Number'}
          </label>
          {confirmationResult ? (
            <input
              ref={verificationInputRef}
              id="phone-input"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white px-4 py-2"
              placeholder="Enter verification code"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerifyCode();
              }}
            />
          ) : (
            <input
              ref={phoneInputRef}
              id="phone-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white px-4 py-2"
              placeholder="+1234567890"
            />
          )}
        </div>

        <button
          onClick={confirmationResult ? handleVerifyCode : handleSendCode}
          className="w-full flex justify-center mt-8 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={(!isPhoneValid && !confirmationResult) || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {confirmationResult ? 'Verifying...' : 'Sending Verification Code...'}
            </span>
          ) : (
            confirmationResult ? 'Verify Phone' : 'Connect Phone'
          )}
        </button>

        <div className="mt-6">
          <StatusIndicator ref={statusRef} />
        </div>
      </div>

      <div 
        id="recaptcha-container" 
        className={`${showRecaptcha ? 'block' : 'hidden'} absolute bottom-0 left-1/2 transform -translate-x-1/2`} 
      />
    </div>
  );
} 