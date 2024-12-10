import { auth } from '@/firebase.config';
import { sendSignInLinkToEmail, User } from "firebase/auth";
import { ActionCodeSettings } from 'firebase-admin/lib/auth/action-code-settings-builder';
import { PhoneAuthProvider } from 'firebase/auth';
import { linkWithCredential, signInWithCredential } from 'firebase/auth';

export const sendMagicLink = async (email: string, userId?: string) => {
  const linkUrl = `${window.location.origin}/auth/complete?userId=${userId}`;
  console.debug('sending sign in link to: ', email, linkUrl);
  
  const actionCodeSettings: ActionCodeSettings = { 
    url: linkUrl, 
    handleCodeInApp: true 
  };
  
  return await sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

export const isValidEmail = (email: string | undefined): boolean => {
  return !!email && email.indexOf("@") !== -1 && email.lastIndexOf(".") !== -1 && email.lastIndexOf(".") !== (email.length - 1) && email.length > 4;
};

export const linkPhoneCredential = async (user: User, verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return await linkWithCredential(user, credential);
};

export const signInWithPhone = async (verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return await signInWithCredential(auth, credential);
};

export const errorMessages: Record<string, string> = {
  'auth/invalid-phone-number': 'Invalid phone number.',
  'auth/captcha-check-failed': 'reCAPTCHA check failed.',
  'auth/account-exists-with-different-credential': 'This phone number is already in use.',
  'auth/invalid-verification-code': 'Invalid verification code.',
};
