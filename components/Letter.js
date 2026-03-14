"use client";
import { useState } from 'react';

export default function Letter({ date, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className="relative w-full max-w-sm cursor-pointer perspective-1000 group"
    >
      {/* The Envelope / Paper Container */}
      <div className={`relative transition-all duration-700 bg-white p-8 rounded-xl shadow-lg border border-pink-100 flex flex-col items-center justify-center min-h-[200px] ${
        isOpen ? 'scale-105 rotate-0' : 'hover:scale-[1.02] -rotate-1'
      }`}>
        
        {!isOpen ? (
          // CLOSED STATE
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
              <span className="text-pink-300 text-xl">✉</span>
            </div>
            <p className="text-pink-300 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Tap to Open
            </p>
          </div>
        ) : (
          // OPEN STATE (REVEALING THE MESSAGE)
          <div className="w-full animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-6 w-full">
              <span className="text-[9px] text-pink-200 font-bold uppercase tracking-widest">{date}</span>
              <span className="text-pink-100">❤</span>
            </div>
            
            <p className="text-teal-900 font-serif italic text-xl leading-relaxed text-center">
              {content || "The ink has faded..."}
            </p>
            
            <div className="mt-8 border-t border-pink-50 pt-4 text-center">
              <p className="text-[8px] text-pink-200 uppercase tracking-widest font-bold">
                A Secret Signal
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Visual Shadow for depth */}
      {!isOpen && (
        <div className="absolute -bottom-2 inset-x-4 h-4 bg-pink-200/20 blur-xl rounded-full -z-10" />
      )}
    </div>
  );
}