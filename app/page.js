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

const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-200">Syncing Satellite...</div>
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [notification, setNotification] = useState(null);

  const themes = {
    romance: {
      style: "bg-white border-pink-200 text-pink-500 shadow-pink-100",
      messages: [
        "A letter just arrived for you... 💌",
        "Majd is thinking of you. Always.",
        "You’re my favorite 'what if'.",
        "Life is better with you in it."
      ]
    },
    upsideDown: {
      style: "bg-black border-red-900 text-red-600 shadow-[0_0_15px_rgba(153,27,27,0.4)] font-serif",
      messages: [
        "A signal from the other side... 🔦",
        "Friends don't lie. Neither does this heart.",
        "The gate is open. He's here.",
        "Signal received from the Upside Down."
      ]
    }
  };

  // 1. Service Worker & Interaction Handshake
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
      });
    }
    
    // Silent Handshake: Enables vibration engine on first tap
    const enableVibe = () => {
      if (navigator.vibrate) navigator.vibrate(0);
      window.removeEventListener('click', enableVibe);
    };
    window.addEventListener('click', enableVibe);
  }, []);

  // 2. Identity Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem("user_identity");
    if (savedUser) setUser(savedUser);
  }, []);

  // 3. Real-Time Engine
  useEffect(() => {
    if (!user) return;
    const partnerID = user === "majd" ? "maram" : "majd";

    const unsubMessage = onSnapshot(doc(db, "settings", "stranger-things"), (docSnap) => {
      if (docSnap.exists()) setSecretMessage(docSnap.data().message || "");
    });

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

      const unsubPartner = onSnapshot(doc(db, "locations", partnerID), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPartnerLocation(data.coords);
          
          if (data.pulse === true) {
            const keys = Object.keys(themes);
            const selectedTheme = themes[keys[Math.floor(Math.random() * keys.length)]];
            const randomMsg = selectedTheme.messages[Math.floor(Math.random() * selectedTheme.messages.length)];

            setNotification({ text: randomMsg, style: selectedTheme.style });
            
            // THE VIBRATION TRIGGER
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            
            setTimeout(() => setNotification(null), 5000);
          }
        }
      });

      return () => {
        unsubMessage();
        unsubPartner();
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [user]);

  const handleTransmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      await updateDoc(doc(db, "settings", "stranger-things"), { message: inputValue.toUpperCase() });
      await addDoc(collection(db, "letters"), {
        content: inputValue.toUpperCase(),
        date: serverTimestamp(),
        sender: user 
      });
      setInputValue(""); 
    } catch (err) { console.error(err); }
  };

  const sendHeartbeat = async () => {
    await updateDoc(doc(db, "locations", user), { pulse: true, pulseTime: serverTimestamp() });
    setTimeout(async () => {
      await updateDoc(doc(db, "locations", user), { pulse: false });
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-3xl font-bold text-pink-400 mb-8 tracking-tighter uppercase">Our Secret Space</h1>
        <div className="flex gap-4">
          <button onClick={() => { localStorage.setItem("user_identity", "majd"); setUser("majd"); }} className="px-10 py-4 bg-white border-2 border-pink-100 rounded-3xl text-pink-400 font-bold active:scale-95 transition-all">Majd</button>
          <button onClick={() => { localStorage.setItem("user_identity", "maram"); setUser("maram"); }} className="px-10 py-4 bg-pink-400 border-2 border-pink-400 rounded-3xl text-white font-bold active:scale-95 transition-all">Maram</button>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-6 relative overflow-x-hidden ${
      isUpsideDown ? 'bg-black text-red-900 font-serif' : 'bg-[#fff5f7] text-teal-900 font-sans'
    }`}>
      
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[5000] w-[90%] max-w-sm p-4 rounded-2xl border-2 shadow-2xl transition-all animate-in slide-in-from-top duration-500 ${notification.style}`}>
          <div className="flex items-center gap-3">
             <span className="animate-bounce">❤</span>
             <p className="text-xs font-bold tracking-tight">{notification.text}</p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsUpsideDown(!isUpsideDown)}
        className={`mt-4 px-6 py-2 rounded-full border-2 transition-all text-[10px] font-black uppercase tracking-[0.3em] ${
          isUpsideDown ? 'border-red-900 text-red-900 shadow-[0_0_20px_red]' : 'border-pink-200 text-pink-300'
        }`}
      >
        {isUpsideDown ? "→ Reality" : "→ Upside Down"}
      </button>

      {!isUpsideDown ? (
        <div className="flex flex-col items-center space-y-8 mt-12 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tighter">Our Space</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-pink-300 font-bold mt-2">Our Secret Space</p>
          </div>
          
          <div className="w-full space-y-3 relative">
             <div className="flex justify-between items-center px-1">
                <div className="flex gap-4">
                  <Link href="/history" className="text-[10px] text-pink-400 uppercase font-black underline decoration-pink-100 underline-offset-4">Archive</Link>
                  <button onClick={() => { localStorage.removeItem("user_identity"); window.location.reload(); }} className="text-[10px] text-slate-300 uppercase font-bold">Log Out</button>
                </div>
             </div>
             <Map userPos={myLocation} partnerPos={partnerLocation} userName={user} />
             <button onClick={sendHeartbeat} className="absolute bottom-4 right-4 z-[1000] bg-white/90 p-4 rounded-full shadow-xl border border-pink-50 active:scale-75 transition-transform">
               <span className="text-xl">❤</span>
             </button>
          </div>

          <div className="w-full pt-6">
            <Letter 
              date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
              content={secretMessage || "The air is still..."} 
            />
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center w-full max-w-md">
          <LightWall message={secretMessage} /> 
          <form onSubmit={handleTransmit} className="mt-16 w-full px-6">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="TRANSFORM SIGNAL..."
              className="w-full bg-transparent border-b border-red-950 p-3 text-center text-red-600 focus:outline-none focus:border-red-700 transition-all font-mono text-sm tracking-[0.2em]"
            />
            <button type="submit" className="w-full mt-6 text-[10px] text-red-950 font-black tracking-[0.5em] uppercase hover:text-red-600">
              [ TRANSMIT ]
            </button>
          </form>
        </div>
      )}
    </main>
  );
}