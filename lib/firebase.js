import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC_4G8ANs9Gi5YOMq_BuGyfQd3ff9xEfJI",
  authDomain: "our-secret-space-56fee.firebaseapp.com",
  projectId: "our-secret-space-56fee",
  storageBucket: "our-secret-space-56fee.firebasestorage.app",
  messagingSenderId: "540266168417",
  appId: "1:540266168417:web:91739eb13dfde8a2512a20",
  measurementId: "G-0TN56RYX56"
};
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Messaging only works in the browser (client-side)
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { db, messaging, getToken, onMessage };