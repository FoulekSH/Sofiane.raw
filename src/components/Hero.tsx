"use client"

import { motion } from "framer-motion"

export default function Hero({ photo }: { photo: string }) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Zoom / Ken Burns Effect */}
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        {photo && (
          <img 
            src={`/photos/${photo}`} 
            alt="Hero Cinematic" 
            className="w-full h-full object-cover"
          />
        )}
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950 opacity-40"></div>

      <div className="relative z-10 text-center px-4 space-y-12">
        <div className="overflow-hidden">
          <motion.h1 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="text-7xl md:text-[14rem] font-bold tracking-tighter leading-[0.8] bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-400 to-amber-200"
          >
            SOFIANE <br /> <span className="font-light italic ml-12 md:ml-32 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-600">RAW</span>
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="flex flex-col items-center gap-8"
        >
          <p className="text-zinc-500 text-xs md:text-sm tracking-[0.8em] uppercase font-bold">
            Fine Art & Cinematic Photography
          </p>
          
          <div className="pt-8">
            <a href="#contact" className="px-12 py-5 bg-white text-black text-[10px] uppercase tracking-[0.4em] font-bold rounded-full hover:bg-zinc-200 transition-all duration-500 transform hover:scale-105">
              Book a Session
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex flex-col items-center gap-4">
         <span className="text-[9px] text-zinc-700 uppercase tracking-[0.4em] rotate-180 vertical-text">Scroll</span>
         <motion.div 
           animate={{ y: [0, 12, 0] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="w-px h-12 bg-gradient-to-b from-zinc-700 to-transparent"
         />
      </div>

      <div className="absolute top-12 left-12 hidden md:block">
         <p className="text-[9px] text-zinc-800 uppercase tracking-[0.4em]">Portfolio v1.0</p>
      </div>
      <div className="absolute top-12 right-12 hidden md:block">
         <p className="text-[9px] text-zinc-800 uppercase tracking-[0.4em]">Paris / Worldwide</p>
      </div>
    </section>
  )
}
