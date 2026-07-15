"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const categoriesList = [
  { slug: "editorial", name: "Mode / Éditorial", fallback: "1775763682718_A7401270.jpg" },
  { slug: "branding", name: "Branding / Content", fallback: "1775763682736_A7401359.jpg" },
  { slug: "event", name: "Événementiel", fallback: "1775763682732_A7401341.jpg" },
  { slug: "sport", name: "Sport", fallback: "A7400010.jpg" },
  { slug: "portrait", name: "Portraits", fallback: "A7400028.jpg" },
  { slug: "auto", name: "Automobile", fallback: "A7400737.jpg" },
]

export default function CategoryCarousel() {
  const [configs, setConfigs] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setConfigs(data))
  }, [])

  return (
    <div className="relative w-full overflow-hidden py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 text-white italic uppercase">
          Parcourir les <span className="font-light text-zinc-500">Séries</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesList.map((cat) => {
            const config = configs.find(c => c.slug === cat.slug)
            const image = config?.coverImage || cat.fallback

            return (
              <Link 
                href={`/portfolio/${cat.slug}`} 
                key={cat.slug}
                className="group relative aspect-square overflow-hidden bg-zinc-900 border border-zinc-800"
              >
                <img 
                  src={`/api/photos/${image}`} 
                  alt={cat.name}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all duration-700 z-10" onContextMenu={(e) => e.preventDefault()} />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-white group-hover:scale-110 transition-transform duration-700">
                    {cat.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
