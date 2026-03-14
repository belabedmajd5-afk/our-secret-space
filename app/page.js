"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Letter from '../components/Letter';
import LightWall from '../components/LightWall';

// Dynamic import for the Map to handle Leaflet's browser-only requirements
const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-pink-50 animate-pulse rounded-2xl flex items-center justify-center text-pink-200">Initializing Satellite...</div>
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);

  // 1. Identity Check (Majd vs Maram)
  useEffect(() => {
    const savedUser = localStorage.getItem("user_identity");
    if (savedUser) setUser(savedUser);
  }, []);

  // 2. Real-Time Data Sync
  useEffect(() => {
    if (!user) return;
    const partnerID = user === "majd" ? "maram" : "majd";

    // Listen for the Stranger Things Signal (brings the message to the lights AND the envelope)
    const unsubMessage = onSnapshot(doc(db, "settings", "stranger-things"), (docSnap) => {
      if (docSnap.exists()) setSecretMessage(docSnap.data().message || "");
    });

    // GPS Tracking
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setMyLocation(coords);
        
        // Update your location in Firebase
        setDoc(doc(db, "locations", user), {
          coords: coords,
          timestamp: new Date(),
          label: user.charAt(0).toUpperCase() + user.slice(1)
        }, { merge: true });
      }, null, { enableHighAccuracy: true });

      // Listen for Maram/Majd's movements
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

  // 3. Evolved Transmission (Updates lights + Saves to Memories)
  const handleTransmitSignal = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const formatted = inputValue.toUpperCase();

    try {
      // Action A: Update the real-time blinking signal
      await updateDoc(doc(db, "settings", "stranger-things"), {
        message: formatted
      });

      // Action B: Save to the permanent Archive (History)
      await addDoc(collection(db, "letters"), {
        content: formatted,
        date: serverTimestamp(),
        sender: user 
      });

      setInputValue(""); 
    } catch (error) {
      console.error("Transmission failed:", error);
    }
  };

  // --- IDENTITY SELECTION ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-pink-400 mb-8 tracking-tight">Accessing Secret Space...</h1>
        <p className="text-slate-400 mb-8 text-sm italic">Identify yourself to continue</p>
        <div className="flex gap-4">
          <button 
            onClick={() => { localStorage.setItem("user_identity", "majd"); setUser("majd"); }} 
            className="px-10 py-4 bg-white border-2 border-pink-100 rounded-3xl text-pink-400 font-bold shadow-sm active:scale-95 transition-all"
          >
            Majd
          </button>
          <button 
            onClick={() => { localStorage.setItem("user_identity", "maram"); setUser("maram"); }} 
            className="px-10 py-4 bg-pink-400 border-2 border-pink-400 rounded-3xl text-white font-bold shadow-lg active:scale-95 transition-all"
          >
            Maram
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-6 ${
      isUpsideDown ? 'bg-black text-red-800 font-serif' : 'bg-[#fff5f7] text-teal-900 font-sans'
    }`}>
      
      {/* THEME TOGGLE BUTTON */}
      <button 
        onClick={() => setIsUpsideDown(!isUpsideDown)}
        className={`mt-4 px-6 py-2 rounded-full border-2 transition-all text-[10px] font-black uppercase tracking-[0.3em] ${
          isUpsideDown 
            ? 'border-red-900 text-red-900 shadow-[0_0_20px_rgba(153,27,27,0.4)]' 
            : 'border-pink-200 text-pink-300'
        }`}
      >
        {isUpsideDown ? "→ Return to Reality" : "→ Enter the Upside Down"}
      </button>

      {!isUpsideDown ? (
        // --- NORMAL MODE (LARA JEAN VIBES) ---
        <div className="flex flex-col items-center space-y-8 mt-12 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-teal-900">Our Space</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-pink-300 font-bold mt-2">Tunis Connection Live</p>
          </div>
          
          <div className="w-full space-y-3">
             <div className="flex justify-between items-center px-1">
                <div className="flex gap-3">
                  <Link href="/history" className="text-[10px] text-pink-400 uppercase font-black underline decoration-pink-200 underline-offset-4">Archive</Link>
                  <button onClick={() => { localStorage.removeItem("user_identity"); window.location.reload(); }} className="text-[10px] text-slate-300 uppercase font-bold">Log Out</button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[9px] text-slate-400 uppercase font-mono">Sync Active</span>
                </div>
             </div>
             
             {/* Shared Map */}
             <Map userPos={myLocation} partnerPos={partnerLocation} userName={user} />
          </div>

          {/* THE DYNAMIC ENVELOPE */}
          <div className="w-full pt-6 flex flex-col items-center">
            <p className="text-[9px] uppercase tracking-[0.5em] text-pink-200 mb-6 font-black">— Latest Signal Transcript —</p>
            <Letter 
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
              content={secretMessage ? `"${secretMessage}"` : "Silence from the other side..."} 
            />
            <p className="mt-6 text-[10px] text-slate-300 italic font-serif">
              {user === 'majd' ? "Signal transmitted to Maram" : "Signal received from Majd"}
            </p>
          </div>
        </div>
      ) : (
        // --- UPSIDE DOWN MODE (STRANGER THINGS VIBES) ---
        <div className="mt-10 flex flex-col items-center w-full max-w-md">
          <LightWall message={secretMessage} /> 
          
          <form onSubmit={handleTransmitSignal} className="mt-16 w-full px-6">
            <div className="relative">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message to the other side..."
                className="w-full bg-transparent border-b border-red-950 p-3 text-center text-red-600 focus:outline-none focus:border-red-700 transition-all font-mono text-sm tracking-[0.2em] placeholder:text-red-950 placeholder:italic"
              />
              <button 
                type="submit" 
                className="w-full mt-6 text-[10px] text-red-950 font-black tracking-[0.5em] uppercase hover:text-red-600 transition-colors"
              >
                [ Send Signal ]
              </button>
            </div>
            <p className="mt-12 text-center text-[9px] text-red-950/40 uppercase tracking-widest leading-loose">
              Warning: Signal will be archived permanently <br /> in the memory vault.
            </p>
          </form>
        </div>
      )}
    </main>
  );
}