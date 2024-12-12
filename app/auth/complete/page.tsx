"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { auth } from '@/firebase.config';
import { onAuthStateChanged, User, isSignInWithEmailLink } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useHeader } from '@/src/contexts/HeaderContext';
import { EMAIL_STORAGE_KEY } from '@/src/models/constants';
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';
import { useUser } from '@/src/contexts/UserContext';
import { isValidEmail, linkEmailCredential, signInWithMagicLink } from '@/src/services/authService';
import { trackEvent } from '@/src/services/metricsSerivce';

function CompleteEmailAuth() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [extractedUserId, setExtractedUserId] = useState<string | null>(null);
  const [extractedJournalId, setExtractedJournalId] = useState<string | null>(null);

  const { branding } = useHeader();
  const statusRef = useRef<StatusIndicatorHandle>(null);
  const firebaseUser = useRef<User | null>(null);
  const { syncLocalUser, updateUser, user, isInitialized } = useUser();
  const authUnsubscribe = useRef<(() => void) | null>(null);
  const [firebaseUserState, setFirebaseUserState] = useState<User | null>(null);
  const [hasSignInLink, setHasSignInLink] = useState(false);

  useEffect(() => {
    const continueUrl = searchParams.get("continueUrl");
    if (continueUrl) {
      const decodedContinueUrl = decodeURIComponent(continueUrl);
      const queryString = decodedContinueUrl.split('?')[1] || '';
      const continueUrlSearchParams = new URLSearchParams(queryString);

      setExtractedUserId(continueUrlSearchParams.get('userId'));
      setExtractedJournalId(continueUrlSearchParams.get('journalEntryId'));
    }

    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      setHasSignInLink(true);
    }

    authUnsubscribe.current = onAuthStateChanged(auth, async (user) => {
      firebaseUser.current = user;
      setFirebaseUserState(user);
    });

    return () => {
      if (authUnsubscribe.current) authUnsubscribe.current();
    };
  }, [searchParams]);

  const handlePostAuthRedirect = useCallback(() => {
    const suffix = extractedJournalId !== null && extractedJournalId !== '' ? `/${extractedJournalId}` : '';
    router.push(`/journals${suffix}`);
  }, [extractedJournalId, router]);

  const handleUpdateUser = useCallback(async () => {
    statusRef.current?.pushMessage({ type: 'loading', text: "Updating user..." });
    console.debug('updating user with email: ', email);
    
    const clonedUser = {
      ...user,
      profile: {
        ...user?.profile,
        email: email,
        isAnonymous: false,
      }
    };

    await updateUser(clonedUser);
    console.debug('updated user');
    statusRef.current?.pushMessage({ type: 'success', text: "Updated user!" });
    await syncLocalUser();
  }, [email, user, updateUser, syncLocalUser]);

  const completeEmailLinkSignIn = useCallback(async () => {
    if (!email) {
      statusRef.current?.pushMessage({ type: 'info', text: "Please provide your email to complete sign-in!" });
      return;
    }

    try {
      if (!!firebaseUser.current) {
        if (firebaseUser.current.uid !== extractedUserId) {
          console.error('user id mismatch', firebaseUser.current.uid, extractedUserId);
          statusRef.current?.pushMessage({ type: 'error', text: "User ID mismatch, unable to link account!" });
          return;
        }
        statusRef.current?.pushMessage({ type: 'loading', text: "Linking account with email..." });
        console.log(`linking ${firebaseUser.current.uid} with email ${email}`);
        try {
          await linkEmailCredential(firebaseUser.current, email);
          statusRef.current?.pushMessage({ type: 'success', text: "Linked account with email!" });
          console.log(`linked ${firebaseUser.current.uid} with email ${email}`);
          await handleUpdateUser();
          handlePostAuthRedirect();
        } catch (error) {
          console.error("Error linking account with email:", error);
          trackEvent("auth", "magic-link-auth-error", { userId: firebaseUser.current?.uid, email});
          statusRef.current?.pushMessage({ type: 'error', text: "Failed to link account with email: " + (error as Error).message });
        }
      } else {
        console.debug('signing in with email link');
        await signInWithMagicLink(email, window.location.href);
        console.debug('signed in as user: ', email);
        statusRef.current?.pushMessage({ type: 'success', text: "Signed in! Redirecting..." });
        handlePostAuthRedirect();
      }

    } catch (error) {
      console.error("Error completing email link sign-in:", error);
      trackEvent("auth", "magic-link-auth-error", { userId: firebaseUser.current?.uid, email});
      statusRef.current?.pushMessage({ type: 'error', text: "Failed to complete sign-in: " + (error as Error).message });
    }
  }, [email, extractedUserId, handlePostAuthRedirect, handleUpdateUser]);

  useEffect(() => {
    if (isInitialized && hasSignInLink && email && isValidEmail(email)) {
      localStorage.setItem(EMAIL_STORAGE_KEY, email);
      setHasSignInLink(false);
      completeEmailLinkSignIn();
      trackEvent("auth", "magic-link-received", { userId: firebaseUser.current?.uid, email });
    }
  }, [isInitialized, hasSignInLink, email, completeEmailLinkSignIn]);

  const handleRouteAction = useCallback(() => {
    if (!!firebaseUserState) {
      handlePostAuthRedirect();
    } else {
      router.push('/welcome');
    }
  }, [firebaseUserState, handlePostAuthRedirect, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">{branding.appName}</h1>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div>
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

          <StatusIndicator ref={statusRef} />

          <button
            onClick={handleRouteAction}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline focus:outline-none"
          >
            Continue without Sign In
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CompleteEmailAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteEmailAuth />
    </Suspense>
  );
} 