"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export default function Gallery({ photos }: { photos: string[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  if (photos.length === 0) {
    return <div className="text-zinc-400 italic py-20 text-center uppercase tracking-widest text-xs">Collection en cours de préparation...</div>
  }

  return (
    <div className="space-y-4">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.05 }}
            className="relative overflow-hidden bg-zinc-100 cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <motion.img
              src={`/api/photos/${photo}`}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
               <span className="text-white text-[10px] uppercase tracking-[0.3em] font-bold border border-white/40 px-4 py-2 backdrop-blur-sm">Voir l'œuvre</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={`/api/photos/${selectedPhoto}`} 
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
          <button className="absolute top-8 right-8 text-white text-3xl font-light">&times;</button>
        </div>
      )}
    </div>
  )
}
