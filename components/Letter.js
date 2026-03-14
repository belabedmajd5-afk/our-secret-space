"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Letter({ content, date }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="flex flex-col items-center my-4 cursor-pointer" 
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* The Envelope Body */}
      <motion.div 
        className="w-64 h-40 bg-pink-100 border-2 border-pink-200 shadow-md relative z-20 rounded-b-lg flex items-center justify-center"
        animate={isOpen ? { y: 20 } : { y: 0 }}
      >
        <p className="text-pink-300 font-bold text-xs">TAP TO OPEN</p>
        
        {/* The Envelope Flap */}
        <motion.div 
          className="absolute top-0 w-full h-full bg-pink-200 origin-top border-b border-pink-300 rounded-t-sm"
          style={{ backfaceVisibility: "hidden" }}
          animate={isOpen ? { rotateX: 180 } : { rotateX: 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* The Secret Note (Slides out from behind) */}
      {isOpen && (
        <motion.div 
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -120, opacity: 1 }}
          className="w-56 bg-white p-4 shadow-xl font-mono text-sm text-slate-700 z-10 border-t-4 border-pink-400"
        >
          <p className="text-[10px] text-pink-400 mb-2 uppercase tracking-widest">{date}</p>
          {content}
        </motion.div>
      )}
    </div>
  );
}