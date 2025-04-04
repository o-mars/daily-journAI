"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { auth } from '../../firebase.config';
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useHeader } from '@/src/contexts/HeaderContext';
import StatusIndicator, { StatusIndicatorHandle } from '@/src/components/StatusIndicator';
import EmailAuth from '@/src/components/EmailAuth';

function AuthForm() {
  const router = useRouter();
  const { branding } = useHeader();
  const statusRef = useRef<StatusIndicatorHandle>(null);
  const firebaseUser = useRef<User | null>(null);
  const authUnsubscribe = useRef<(() => void) | null>(null);
  const [firebaseUserState, setFirebaseUserState] = useState<User | null>(null);

  useEffect(() => {
    authUnsubscribe.current = onAuthStateChanged(auth, async (user) => {
      firebaseUser.current = user;
      setFirebaseUserState(user);
    });

    return () => {
      if (authUnsubscribe.current) authUnsubscribe.current();
    };
  }, []);

  const handlePostAuthRedirect = useCallback(() => {
    router.push(`/journals`);
  }, [router]);

  const getRouteButtonText = useMemo(() => {
    return !!firebaseUserState
      ? 'Back to App'
      : 'Continue without login';
  }, [firebaseUserState]);

  const handleRouteAction = useCallback(() => {
    if (!!firebaseUserState) {
      handlePostAuthRedirect();
    } else {
      router.push('/welcome');
    }
  }, [firebaseUserState, handlePostAuthRedirect, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-2">{branding.appName}</h1>
        </div>

        <StatusIndicator
          ref={statusRef}
          className="text-primary"
        />

        <div className="bg-surface-1 rounded-lg shadow-xl p-8 space-y-6">
          <EmailAuth
            firebaseUser={firebaseUserState}
          />

          <button
            onClick={handleRouteAction}
            className="text-sm font-medium text-accent-primary hover:text-accent-primary-hover hover:underline focus:outline-none"
          >
            {getRouteButtonText}
          </button>
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
