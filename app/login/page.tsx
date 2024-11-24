"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase.config';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { APP_TITLE } from '@/src/models/constants';
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!!user) router.push('/main');
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/main');
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignup = async () => {
    router.push('/signup');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">{APP_TITLE}</h1>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="space-y-4">
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
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
            
            <div className="text-center">
              <span className="text-gray-400">Don&apos;t have an account?</span>
              <button
                onClick={handleSignup}
                className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

  );
};

export default Login;
