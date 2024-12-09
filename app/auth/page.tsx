"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, 
         linkWithCredential, User, EmailAuthProvider, sendSignInLinkToEmail, 
         isSignInWithEmailLink, signInWithEmailLink, 
         signOut} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useHeader } from '@/src/contexts/HeaderContext';
import { CHECK_EMAIL_MESSAGE, EMAIL_STORAGE_KEY } from '@/src/models/constants';
import { ActionCodeSettings } from 'firebase-admin/lib/auth/action-code-settings-builder';
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';
import { useUser } from '@/src/contexts/UserContext';

function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<'emailLink' | 'signIn' | 'signUp'>('emailLink');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [continueUrl, setContinueUrl] = useState<string | null>(null);

  const { branding } = useHeader();
  const statusRef = useRef<StatusIndicatorHandle>(null);
  const firebaseUser = useRef<User | null>(null);
  const { syncLocalUser, updateUser, user, isInitialized } = useUser();
  const authUnsubscribe = useRef<(() => void) | null>(null);
  const [firebaseUserState, setFirebaseUserState] = useState<User | null>(null);
  const [hasSignInLink, setHasSignInLink] = useState(false);

  useEffect(() => {
    setContinueUrl(searchParams.get("continueUrl"));

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
    const journalId = searchParams.get('journalEntryId');
    router.push(`/journals${journalId ? `/${journalId}` : ''}`);
  }, [searchParams, router]);

  const handleUpdateUser = useCallback(async () => {
    statusRef.current?.pushMessage({ type: 'loading', text: "Updating user..." });
    console.log('updating user to: ', email);
    
    const clonedUser = {
      ...user,
      profile: {
        ...user?.profile,
        email: email,
        isAnonymous: false,
      }
    };

    await updateUser(clonedUser);
    console.log('updated user to: ', clonedUser);
    statusRef.current?.pushMessage({ type: 'success', text: "Updated user!" });
    await syncLocalUser();
    console.log('synced local user');
  }, [email, user, updateUser, syncLocalUser]);

  const isValidEmail = useCallback((email: string) => {
    return email.indexOf("@") !== -1 && email.lastIndexOf(".") !== -1 && email.lastIndexOf(".") !== (email.length - 1);
  }, []);

  const isValidPassword = useCallback((password: string) => password.length >= 8, []);

  const arePasswordsMatching = useCallback((password: string, confirmPassword: string) => 
    password === confirmPassword, []);

  const completeEmailLinkSignIn = useCallback(async () => {
    if (!email) {
      statusRef.current?.pushMessage({ type: 'info', text: "Please provide your email to complete sign-in!" });
      return;
    }

    try {
      const continueUrlSearchParams = new URLSearchParams(continueUrl!);
      // const journalEntryIdFromEmailLink = continueUrlSearchParams.get('journalEntryId');
      const userIdFromEmailLink = continueUrlSearchParams.get('userId');

      if (!!firebaseUser.current) {
        if (firebaseUser.current.uid !== userIdFromEmailLink) {
          statusRef.current?.pushMessage({ type: 'error', text: "User ID mismatch, unable to link account!" });
          return;
        }
        statusRef.current?.pushMessage({ type: 'loading', text: "Linking account with email..." });
        console.log(`linking ${firebaseUser.current.uid} with email ${email}`);
        try {
          const emailCredential = EmailAuthProvider.credentialWithLink(email, window.location.href);
          await linkWithCredential(firebaseUser.current, emailCredential);
          statusRef.current?.pushMessage({ type: 'success', text: "Linked account with email!" });
          console.log(`linked ${firebaseUser.current.uid} with email ${email}`);
          await handleUpdateUser();
          console.log('successfully updated user, redirecting...');
          handlePostAuthRedirect();
        } catch (error) {
          console.error("Error linking account with email:", error);
          statusRef.current?.pushMessage({ type: 'error', text: "Failed to link account with email: " + (error as Error).message });
        }
      } else {
        console.log('signing in with email link');
        const credentialedUser = await signInWithEmailLink(auth, email, window.location.href);
        console.log('signed in as user: ', credentialedUser);
        statusRef.current?.pushMessage({ type: 'success', text: "Signed in! Redirecting..." });
        handlePostAuthRedirect();
      }

    } catch (error) {
      console.error("Error completing email link sign-in:", error);
      statusRef.current?.pushMessage({ type: 'error', text: "Failed to complete sign-in: " + (error as Error).message });
    }
  }, [email, continueUrl, handlePostAuthRedirect, handleUpdateUser]);

  useEffect(() => {
    if (isInitialized && hasSignInLink && email && isValidEmail(email)) {
      setHasSignInLink(false);
      completeEmailLinkSignIn();
    }
  }, [isInitialized, hasSignInLink, email, completeEmailLinkSignIn, isValidEmail]);

  const handleSendMagicLink = useCallback(async () => {
    const linkUrl = `${window.location.origin}/auth?${searchParams.toString()}&userId=${firebaseUser.current?.uid}`;
    console.log('sending sign in link to: ', email, linkUrl);
    const actionCodeSettings: ActionCodeSettings = { url: linkUrl, handleCodeInApp: true };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    statusRef.current?.pushMessage({ type: 'info', text: CHECK_EMAIL_MESSAGE });

    if (authUnsubscribe.current) {
      authUnsubscribe.current();
      console.debug('unsubscribed from auth changes, this tab can be closed');
    }

    setTimeout(() => {
      router.push('/check-email');
    }, 5000);

  }, [email, searchParams]);

  const handleAuth = useCallback(async () => {
    if (!isValidEmail(email)) {
      statusRef.current?.pushMessage({ type: 'error', text: "Please enter a valid email address" });
      return;
    }

    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, email);

      if (authMode === 'emailLink') {
        await handleSendMagicLink();
        return;
      }

      if (authMode === 'signIn') {
        statusRef.current?.pushMessage({ type: 'loading', text: "Signing in..." });
        if (firebaseUser.current) {
          console.warn('signing in with email and password, but user is already signed in');
          statusRef.current?.pushMessage({ type: 'loading', text: "Signing out first..." });
          await signOut(auth);
          statusRef.current?.pushMessage({ type: 'loading', text: "Signed out! Signing in..." });
        }
        await signInWithEmailAndPassword(auth, email, password);
        statusRef.current?.pushMessage({ type: 'success', text: "Signed in! Redirecting..." });
        return;
      }

      if (authMode === 'signUp') {
        if (firebaseUser.current && !firebaseUser.current.isAnonymous) {
          console.warn('signing up with email and password, but regular user is already signed in');
          statusRef.current?.pushMessage({ type: 'loading', text: "Signing out first..." });
          await signOut(auth);
          statusRef.current?.pushMessage({ type: 'loading', text: "Signed out! Signing up..." });
          console.warn('signed out, signing up with email and password');
        }
        if (firebaseUser.current?.isAnonymous) {
          console.log('linking account with email');
          statusRef.current?.pushMessage({ type: 'loading', text: "Linking account with email..." });
          const credential = EmailAuthProvider.credential(email, password);
          await linkWithCredential(firebaseUser.current, credential);
          statusRef.current?.pushMessage({ type: 'loading', text: "Linked account with email!" });
          console.log('linked account with email');
        } else {
          console.log('creating account');
          statusRef.current?.pushMessage({ type: 'loading', text: "Creating account..." });
          await createUserWithEmailAndPassword(auth, email, password);
          statusRef.current?.pushMessage({ type: 'loading', text: "Created account!" });
          console.log('created account');
        }
        console.log('updating user');
        await handleUpdateUser();
        console.log('updated user');
        const successMessage = firebaseUser.current?.isAnonymous ? "Successfully linked account with email!" : "Successfully created account!";
        statusRef.current?.pushMessage({ type: 'success', text: successMessage });
        console.log('redirecting');
        handlePostAuthRedirect();
      }
    } catch (error) {
      console.error("Auth error:", error);
      statusRef.current?.pushMessage({ type: 'error', text: `Authentication failed: ${(error as Error).message}` });
    }
  }, [email, authMode, handleSendMagicLink, isValidEmail, handleUpdateUser, handlePostAuthRedirect, password]);

  const isFormValid = useMemo(() => {
    if (password !== '' && confirmPassword !== '') {
      return isValidEmail(email) && isValidPassword(password) && arePasswordsMatching(password, confirmPassword);
    }
    return isValidEmail(email);
  }, [email, password, confirmPassword, isValidEmail, isValidPassword, arePasswordsMatching]);

  const getActionButtonText = useMemo(() => {
    switch (authMode) {
      case 'emailLink': return 'Send Sign In Link';
      case 'signIn': return 'Sign In';
      case 'signUp': return 'Create Account';
    }
  }, [authMode]);

  const renderAuthOptions = useMemo(() => {
    return (
      <div className="flex justify-evenly space-x-4 text-sm">
        {authMode !== 'emailLink' && (
          <button
            onClick={() => setAuthMode('emailLink')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Use magic link
          </button>
        )}
        {authMode !== 'signIn' && !firebaseUserState && (
          <button
            onClick={() => setAuthMode('signIn')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Sign in with password
          </button>
        )}
        {authMode !== 'signUp' && (firebaseUserState?.isAnonymous || !firebaseUserState) && (
          <button
            onClick={() => setAuthMode('signUp')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Create account
          </button>
        )}
      </div>
    );
  }, [authMode, firebaseUserState]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">{branding.appName}</h1>
        </div>

        <StatusIndicator
          ref={statusRef}
          className="text-white"
        />

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

          {authMode !== 'emailLink' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white px-4 py-2"
                placeholder="••••••••"
              />
            </div>
          )}

          {authMode === 'signUp' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white px-4 py-2"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            onClick={handleAuth}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={!isFormValid}
          >
            {getActionButtonText}
          </button>

          {renderAuthOptions}
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
} 