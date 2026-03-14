"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import Letter from '../components/Letter';
import LightWall from '../components/LightWall';

export default function Home() {
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [secretMessage, setSecretMessage] = useState("LOADING");

  // This "useEffect" connects to Firebase and listens for changes
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "stranger-things"), (doc) => {
      if (doc.exists()) {
        setSecretMessage(doc.data().message || "NO SIGNAL");
      }
    });
    return () => unsub(); // Cleanup listener on unmount
  }, []);

  return (
    <main className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-6 ${
      isUpsideDown 
        ? 'bg-black text-red-700 font-serif' 
        : 'bg-[#fff5f7] text-teal-900 font-sans'
    }`}>
      
      <button 
        onClick={() => setIsUpsideDown(!isUpsideDown)}
        className={`mt-4 px-6 py-2 rounded-full border-2 transition-all text-xs font-bold tracking-widest uppercase ${
          isUpsideDown 
            ? 'border-red-900 text-red-900 shadow-[0_0_15px_red]' 
            : 'border-pink-300 text-pink-400'
        }`}
      >
        {isUpsideDown ? "Return to the Real World" : "Enter the Upside Down"}
      </button>

      <h1 className={`text-3xl mt-12 mb-8 text-center font-bold ${
        isUpsideDown ? 'italic uppercase tracking-widest' : ''
      }`}>
        {isUpsideDown ? "DO YOU COPY?" : "To All the Things I Love"}
      </h1>

      {!isUpsideDown && (
        <div className="flex flex-col space-y-4">
          <Letter 
            date="March 14, 2026" 
            content="I made this secret space just for us. Tap the NFC tag anytime to find a new message from me." 
          />
        </div>
      )}

      {isUpsideDown && (
        <div className="mt-10 flex flex-col items-center">
          {/* Now using the message from Firebase! */}
          <LightWall message={secretMessage} /> 
        </div>
      )}
    </main>
  );
}