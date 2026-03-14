"use client";
import { useState, useEffect } from "react";

export default function LightWall({ message }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 1. Clean the message (remove spaces, make uppercase)
  const cleanMessage = message.toUpperCase().replace(/\s/g, "");
  
  // 2. Stranger Things Alphabet Layout
  const rows = [
    "ABCDEFGH".split(""),
    "IJKLMNOPQ".split(""),
    "RSTUVWXYZ".split("")
  ];

  useEffect(() => {
    if (cleanMessage.length === 0) return;

    // 3. The Sequencer: This changes the active letter every 1.5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // If we reach the end of the word, go back to the start
        return (prevIndex + 1) % cleanMessage.length;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [cleanMessage]);

  // This is the letter that should be glowing right now
  const activeChar = cleanMessage[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-10">
      <div className="bg-black/40 p-10 rounded-3xl border border-red-900/30 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-6 mb-10 last:mb-0">
            {row.map((char) => {
              const isLit = char === activeChar;
              
              return (
                <div key={char} className="flex flex-col items-center w-6">
                  {/* The Bulb */}
                  <div 
                    className={`w-3 h-3 rounded-full mb-3 transition-all duration-300 ${
                      isLit 
                        ? 'bg-yellow-100 shadow-[0_0_30px_#fef08a,0_0_60px_#facc15]' 
                        : 'bg-zinc-900 border border-zinc-800'
                    }`}
                  />
                  {/* The Letter */}
                  <span className={`text-2xl font-bold transition-all duration-300 font-serif ${
                    isLit ? 'text-yellow-100 scale-150' : 'text-zinc-800'
                  }`}>
                    {char}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Small indicator at the bottom to show it's working */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] tracking-[0.5em] text-red-950 animate-pulse font-mono">
          LISTENING...
        </p>
        <div className="flex gap-1">
          {cleanMessage.split("").map((_, i) => (
            <div key={i} className={`h-1 w-1 rounded-full ${i === currentIndex ? 'bg-red-600' : 'bg-zinc-900'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}