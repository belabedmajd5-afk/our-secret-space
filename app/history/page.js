"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Link from 'next/link';

export default function History() {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    // 1. Point to your 'letters' collection
    const q = query(collection(db, "letters"), orderBy("date", "desc"));
    
    const unsub = onSnapshot(q, (querySnapshot) => {
      const lettersArray = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        lettersArray.push({ 
          id: doc.id,
          content: data.content, // Matches your "content" field in the screenshot
          date: data.date,       // Matches your "date" field
          sender: data.sender    // Matches your "sender" field
        });
      });
      setLetters(lettersArray);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff5f7] p-8 font-sans">
      <Link href="/" className="text-pink-300 text-[10px] uppercase tracking-[0.3em] font-bold mb-12 block hover:text-pink-400 transition-all">
        ← Back to Space
      </Link>
      
      <h1 className="text-3xl font-bold text-pink-400 mb-12 text-center tracking-tight">The Archive</h1>

      <div className="grid gap-10 max-w-md mx-auto">
        {letters.length === 0 ? (
          <p className="text-center text-slate-300 italic font-serif">Waiting for the first signal...</p>
        ) : (
          letters.map((letter) => (
            <div key={letter.id} className="group relative">
              {/* Envelope Layer */}
              <div className="absolute inset-0 bg-pink-100/50 rounded-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500" />
              
              {/* Paper Layer */}
              <div className="relative bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-pink-50 transform -rotate-1 group-hover:-translate-y-2 transition-all duration-300">
                
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[9px] text-pink-300 uppercase tracking-widest font-black">
                    {/* The fix: checks if date exists before calling toDate() */}
                    {letter.date ? letter.date.toDate().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : "Receiving..."}
                  </p>
                  <div className="w-7 h-7 bg-pink-50 rounded-full flex items-center justify-center text-[10px] text-pink-400 font-bold border border-pink-100">
                    {letter.sender?.charAt(0).toUpperCase()}
                  </div>
                </div>

                <p className="text-slate-800 leading-relaxed font-serif italic text-xl">
                  "{letter.content}"
                </p>
                
                <div className="mt-8 pt-4 border-t border-dashed border-pink-100 flex justify-between items-center">
                  <span className="text-[8px] text-slate-300 uppercase tracking-[0.2em] font-mono">
                    Logged by {letter.sender}
                  </span>
                  <span className="text-pink-200 animate-pulse">❤</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}