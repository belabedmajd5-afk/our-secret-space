"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Letter from '../components/Letter';
import LightWall from '../components/LightWall';

// Dynamic import for the Map to prevent hydration errors
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [user, setUser] = useState(null);
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);

  // 1. Initial Identity Check
  useEffect(() => {
    const savedUser = localStorage.getItem("user_identity");
    if (savedUser) setUser(savedUser);
  }, []);

  // 2. Real-time Data Sync
  useEffect(() => {
    if (!user) return;
    const partnerID = user === "majd" ? "maram" : "majd";

    // Listen for Stranger Things Signal
    const unsubMessage = onSnapshot(doc(db, "settings", "stranger-things"), (docSnap) => {
      if (docSnap.exists()) setSecretMessage(docSnap.data().message || "");
    });

    // Track GPS and Listen for Partner
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setMyLocation(coords);
        
        // Update Firebase with your current spot
        setDoc(doc(db, "locations", user), {
          coords: coords,
          timestamp: new Date(),
          label: user.charAt(0).toUpperCase() + user.slice(1)
        }, { merge: true });
      }, null, { enableHighAccuracy: true });

      // Watch Maram/Majd's movements
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

  // 3. Send Signal Logic
  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    await updateDoc(doc(db, "settings", "stranger-things"), {
      message: inputValue.toUpperCase()
    });
    setInputValue(""); 
  };

  // --- IDENTITY SELECTION SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-pink-400 mb-8 font-sans">Who is entering the space?</h1>
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
      
      {/* THEME TOGGLE */}
      <button 
        onClick={() => setIsUpsideDown(!isUpsideDown)}
        className={`mt-4 px-6 py-2 rounded-full border-2 transition-all text-xs font-bold uppercase tracking-widest ${
          isUpsideDown ? 'border-red-900 text-red-900 shadow-[0_0_15px_red]' : 'border-pink-300 text-pink-400'
        }`}
      >
        {isUpsideDown ? "Return to Reality" : "Enter the Upside Down"}
      </button>

      {!isUpsideDown ? (
        // --- LARA JEAN MODE (NORMAL WORLD) ---
        <div className="flex flex-col items-center space-y-8 mt-12 w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">Our Secret Space</h1>
          
          <div className="w-full space-y-2">
             <div className="flex justify-between items-center px-2">
                <div className="flex gap-3">
                  <Link href="/history" className="text-[9px] text-pink-400 uppercase font-bold underline">Memories</Link>
                  <button onClick={() => { localStorage.removeItem("user_identity"); window.location.reload(); }} className="text-[9px] text-slate-300 uppercase underline">Switch User</button>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-pink-400 font-bold italic">Live Connection</p>
             </div>
             <Map userPos={myLocation} partnerPos={partnerLocation} />
          </div>

          <Letter 
            date="March 14, 2026" 
            content={`Hey ${user === 'majd' ? 'Maram' : 'Majd'}, I'm glad you're here. Tap the 'Memories' link to see all our letters.`} 
          />
        </div>
      ) : (
        // --- STRANGER THINGS MODE (THE UPSIDE DOWN) ---
        <div className="mt-10 flex flex-col items-center w-full max-w-md">
          <LightWall message={secretMessage} /> 
          
          <form onSubmit={handleUpdateMessage} className="mt-12 w-full px-4">
            <div className="relative group">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Send a signal to the other side..."
                className="w-full bg-transparent border-b-2 border-red-900/30 p-2 text-center text-red-700 focus:outline-none focus:border-red-600 transition-all font-mono text-sm tracking-widest placeholder:text-red-900/10"
              />
              <button 
                type="submit"
                className="w-full mt-4 text-[10px] text-red-900 font-bold tracking-[0.4em] uppercase opacity-50 hover:opacity-100 transition-opacity"
              >
                Transmit Signal
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}