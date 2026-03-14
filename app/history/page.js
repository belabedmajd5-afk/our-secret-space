"use client";
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Link from 'next/link';

export default function History() {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "letters"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const lettersArray = [];
      querySnapshot.forEach((doc) => {
        lettersArray.push({ ...doc.data(), id: doc.id });
      });
      setLetters(lettersArray);
    });
    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff5f7] p-8 font-sans">
      <Link href="/" className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-8 block hover:text-pink-400 transition-colors">
        ← Back to Space
      </Link>
      
      <h1 className="text-3xl font-bold text-pink-400 mb-12 text-center">The Archive</h1>

      <div className="grid gap-8 max-w-md mx-auto">
        {letters.length === 0 ? (
          <p className="text-center text-slate-400 italic font-serif">No signals recorded yet...</p>
        ) : (
          letters.map((letter) => (
            <div key={letter.id} className="group relative">
              <div className="absolute inset-0 bg-pink-100 rounded-xl transform rotate-1 group-hover:rotate-0 transition-transform duration-300" />
              <div className="relative bg-white p-8 rounded-xl shadow-sm border border-pink-50 transform -rotate-1 group-hover:-translate-y-2 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] text-pink-300 uppercase tracking-[0.2em] font-bold">
                    {letter.date?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-[10px] text-pink-300 font-bold uppercase">
                    {letter.sender?.charAt(0)}
                  </div>
                </div>
                <p className="text-slate-800 leading-relaxed font-serif italic text-lg">
                  "{letter.content}"
                </p>
                <div className="mt-6 border-t border-pink-50 pt-4 flex justify-between items-center">
                  <span className="text-[8px] text-pink-200 uppercase tracking-widest font-mono">
                    Received from {letter.sender}
                  </span>
                  <div className="text-pink-100">❤</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}