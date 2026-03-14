import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_4G8ANs9Gi5YOMq_BuGyfQd3ff9xEfJI",
  authDomain: "our-secret-space-56fee.firebaseapp.com",
  projectId: "our-secret-space-56fee",
  storageBucket: "our-secret-space-56fee.firebasestorage.app",
  messagingSenderId: "540266168417",
  appId: "1:540266168417:web:91739eb13dfde8a2512a20",
  measurementId: "G-0TN56RYX56"
};

// This prevents Firebase from initializing multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };