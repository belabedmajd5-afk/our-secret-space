"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';
import Letter from '../components/Letter';
import LightWall from '../components/LightWall';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [user, setUser] = useState(null); // 'majd' or 'maram'
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);

  // 1. Check who is using the app on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user_identity");
    if (savedUser) setUser(savedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const partnerID = user === "majd" ? "maram" : "majd";

    // 2. Listen for the Secret Message
    const unsubMessage = onSnapshot(doc(db, "settings", "stranger-things"), (docSnap) => {
      if (docSnap.exists()) setSecretMessage(docSnap.data().message || "");
    });

    // 3. Track Location
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setMyLocation(coords);
        
        setDoc(doc(db, "locations", user), {
          coords: coords,
          timestamp: new Date(),
          label: user.charAt(0).toUpperCase() + user.slice(1)
        }, { merge: true });
      }, null, { enableHighAccuracy: true });

      // 4. Listen for Partner
      const unsubPartner = onSnapshot(doc(db, "locations", partnerID), (docSnap) => {
        if (docSnap.exists()) setPartnerLocation(docSnap.data().coords);
      });

      return () => {
        unsubMessage();
        unsubPartner();
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [user]);

  // The "Identity Selection" Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-pink-400 mb-8">Who is entering the space?</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => { localStorage.setItem("user_identity", "majd"); setUser("majd"); }}
            className="px-8 py-3 bg-white border-2 border-pink-200 rounded-2xl text-pink-400 font-bold shadow-sm"
          >
            Majd
          </button>
          <button 
            onClick={() => { localStorage.setItem("user_identity", "maram"); setUser("maram"); }}
            className="px-8 py-3 bg-pink-400 border-2 border-pink-400 rounded-2xl text-white font-bold shadow-md"
          >
            Maram
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Our Secret Space</h1>
          
          <div className="w-full space-y-2">
             <div className="flex justify-between items-center px-2">
                <p className="text-[10px] uppercase tracking-widest text-pink-400 font-bold">Live Pulse</p>
                <button 
                  onClick={() => { localStorage.removeItem("user_identity"); window.location.reload(); }}
                  className="text-[9px] text-slate-300 uppercase underline"
                >
                  Switch User
                </button>
             </div>
             <Map userPos={myLocation} partnerPos={partnerLocation} />
          </div>

          <Letter 
            date="March 14, 2026" 
            content={`Hey ${user === 'majd' ? 'Maram' : 'Majd'}, I'm glad you're here.`} 
          />
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