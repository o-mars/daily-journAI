"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { APP_TITLE } from '@/src/models/constants';

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!!user) router.push('/main');
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/main');
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to create account: " + (error as Error).message);
    }
  };

  const handleLogin = () => {
    router.push('/login');
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
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignup}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Account
            </button>
            
            <div className="text-center">
              <span className="text-gray-400">Already have an account?</span>
              <button
                onClick={handleLogin}
                className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup; 