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
      <Link href="/" className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-8 block">
        ← Back to Space
      </Link>
      
      <h1 className="text-3xl font-bold text-pink-400 mb-12">Our Memory Box</h1>

      <div className="flex flex-col gap-6 max-w-md mx-auto">
        {letters.map((letter) => (
          <div key={letter.id} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 transform -rotate-1 hover:rotate-0 transition-transform">
            <p className="text-[10px] text-pink-300 uppercase tracking-widest mb-2">
              {letter.date?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-slate-700 leading-relaxed font-serif italic">
              "{letter.content}"
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}