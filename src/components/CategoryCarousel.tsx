"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const categories = [
  { id: "sport", name: "Sport", image: "/photos/A7400010.jpg" },
  { id: "portrait", name: "Portrait", image: "/photos/A7400028.jpg" },
  { id: "event", name: "Événementiel", image: "/photos/A7400340-2.jpg" },
  { id: "lifestyle", name: "Lifestyle", image: "/photos/A7400344.jpg" },
  { id: "auto", name: "Automobile", image: "/photos/A7400737.jpg" },
  { id: "mariage", name: "Mariage", image: "/photos/A7400998.jpg" },
]

export default function CategoryCarousel() {
  const [index, setIndex] = useState(0)

  const next = () => setIndex((prev) => (prev + 1) % categories.length)
  const prev = () => setIndex((prev) => (prev - 1 + categories.length) % categories.length)

  return (
    <div className="relative w-full overflow-hidden py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 text-white italic uppercase">
          Parcourir les <span className="font-light">Séries</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <Link 
              href={`/portfolio?cat=${cat.id}`} 
              key={cat.id}
              className="group relative aspect-square overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <img 
                src={cat.image} 
                alt={cat.name}
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-white group-hover:scale-110 transition-transform duration-700">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
