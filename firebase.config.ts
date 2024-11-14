import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQZ6uBHhhqgXR-nUJ2upLqEqsGx7dLt8Q",
  authDomain: "note-taking-app-d0eca.firebaseapp.com",
  projectId: "note-taking-app-d0eca",
  storageBucket: "note-taking-app-d0eca.appspot.com",
  messagingSenderId: "1015595119708",
  appId: "1:1015595119708:web:574e7f707059e944636299",
  measurementId: "G-QNPHTQQ0R9"
};

const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);