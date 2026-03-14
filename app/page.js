"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';
import Letter from '../components/Letter';
import LightWall from '../components/LightWall';

// Import Map dynamically to avoid SSR errors
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // 1. Listen for the Secret Message
    const unsubMessage = onSnapshot(doc(db, "settings", "stranger-things"), (docSnap) => {
      if (docSnap.exists()) setSecretMessage(docSnap.data().message || "");
    });

    // 2. Track My Location & Update Firebase
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setLocation(coords);
        
        // Save to Firebase (We'll call you 'User A' for now)
        setDoc(doc(db, "locations", "majd"), {
          coords: coords,
          timestamp: new Date()
        }, { merge: true });
      });
    }

    return () => unsubMessage();
  }, []);

  return (
    <main className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-6 ${
      isUpsideDown ? 'bg-black text-red-700 font-serif' : 'bg-[#fff5f7] text-teal-900 font-sans'
    }`}>
      
      <button 
        onClick={() => setIsUpsideDown(!isUpsideDown)}
        className="mt-4 px-6 py-2 rounded-full border-2 border-pink-300 text-pink-400 text-xs font-bold uppercase tracking-widest"
      >
        {isUpsideDown ? "Return Home" : "Enter the Upside Down"}
      </button>

      {!isUpsideDown && (
        <div className="flex flex-col items-center space-y-8 mt-12 w-full max-w-md">
          <h1 className="text-3xl font-bold">Our Secret Space</h1>
          
          {/* THE MAP SECTION */}
          <div className="w-full space-y-2">
             <p className="text-[10px] uppercase tracking-widest text-pink-300 ml-2 font-bold">Live Connection</p>
             <Map userPos={location} />
          </div>

          <Letter date="March 14, 2026" content="I'm adding the map so we're never truly lost from each other." />
        </div>
      )}

      {isUpsideDown && (
        <div className="mt-10 flex flex-col items-center">
          <LightWall message={secretMessage} /> 
        </div>
      )}
    </main>
  );
}