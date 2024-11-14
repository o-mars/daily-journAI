"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase.config';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import './Login.css';

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <h1 className="text-4xl font-bold">JournAI</h1>
    <div className="login-container">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Signup</button>
    </div>
    </main>


  );
};

export default Login;
