import { auth } from '@/firebase.config';
import { EmailAuthProvider, sendSignInLinkToEmail, signInWithEmailLink, User, linkWithCredential, signInWithCredential, signOut as firebaseSignOut, signInAnonymously } from 'firebase/auth';
import { ActionCodeSettings } from 'firebase-admin/lib/auth/action-code-settings-builder';
import { PhoneAuthProvider } from 'firebase/auth';
import { trackEvent } from '@/src/services/metricsSerivce';

export const sendMagicLink = async (email: string, userId: string = '', journalEntryId: string = '') => {
  const linkUrl = `${window.location.origin}/auth/complete?userId=${userId}&journalEntryId=${journalEntryId}`;
  console.debug('sending sign in link to: ', email, linkUrl);
  
  const actionCodeSettings: ActionCodeSettings = { 
    url: linkUrl, 
    handleCodeInApp: true 
  };
  
  const result = await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  trackEvent("auth", "magic-link-sent", { userId, email, journalEntryId });
  return result;
};

export const isValidEmail = (email: string | undefined): boolean => {
  return !!email && email.indexOf("@") !== -1 && email.lastIndexOf(".") !== -1 && email.lastIndexOf(".") !== (email.length - 1) && email.length > 4;
};

export const signInWithMagicLink = async (email: string, link: string) => {
  const result = await signInWithEmailLink(auth, email, link);
  trackEvent("auth", "magic-link-authenticated", { userId: result.user?.uid, email });
  return result;
};

export const linkEmailCredential = async (user: User, email: string) => {
  const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
  const result = await linkWithCredential(user, credential);
  trackEvent("auth", "account-linked", { userId: result.user?.uid, method: "email" });
  return result;
};

export const linkPhoneCredential = async (user: User, verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await linkWithCredential(user, credential);
  trackEvent("auth", "account-linked", { userId: result.user?.uid, method: "phone" });
  return result;
};

export const signInWithPhone = async (verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(auth, credential);
  trackEvent("auth", "login", { userId: result.user?.uid, method: "phone" });
  return result;
};

export const errorMessages: Record<string, string> = {
  'auth/invalid-phone-number': 'Invalid phone number.',
  'auth/captcha-check-failed': 'reCAPTCHA check failed.',
  'auth/account-exists-with-different-credential': 'This phone number is already in use.',
  'auth/invalid-verification-code': 'Invalid verification code.',
};

export const signOut = async () => {
  const userId = auth.currentUser?.uid;
  await firebaseSignOut(auth);
  trackEvent("auth", "logout", { userId });
  return;
}

export const signInWithNewAnonymousUser = async () => {
  const result = await signInAnonymously(auth);
  trackEvent("auth", "login", { userId: result.user?.uid, method: "anonymous" });
  return result;
}