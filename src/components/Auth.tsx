import React, { useState } from 'react';
import EmailAuth from './EmailAuth';
import PhoneAuth from './PhoneAuth';
import { User } from 'firebase/auth';

interface AuthSelectorProps {
  firebaseUser: User | null;
  onSuccess?: () => void;
  testMode?: boolean;
}

export default function Auth({
  firebaseUser,
  onSuccess,
  testMode = false
}: AuthSelectorProps) {
  const [method, setMethod] = useState<'email' | 'phone'>('phone');

  return (
    <div className="space-y-6">
      {method === 'email' ? (
        <EmailAuth firebaseUser={firebaseUser} />
      ) : (
        <PhoneAuth 
          mode="signIn" 
          onSuccess={onSuccess}
          testMode={testMode}
          key={!firebaseUser ? 'signIn' : firebaseUser?.isAnonymous ? 'link' : 'signUp'}
        />
      )}
      <button
        onClick={() => setMethod(method === 'email' ? 'phone' : 'email')}
        className="w-full text-sm font-medium text-left text-indigo-400 hover:text-indigo-300 hover:underline focus:outline-none"
      >
        Connect {method === 'email' ? 'phone' : 'email'} number instead
      </button>
    </div>
  );
}