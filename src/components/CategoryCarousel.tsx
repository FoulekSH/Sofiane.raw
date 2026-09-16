"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CATEGORIES } from "@/lib/categories"

// Image de secours par catégorie tant qu'aucune couverture n'est définie en admin.
const FALLBACKS: Record<string, string> = {
  editorial: "1788372699331_A7409178.jpg",
  branding: "1788372797952_A7400344.jpg",
  event: "1788373241322_A7401341.jpg",
  sport: "1788373271284_A7401791.jpg",
  portrait: "1788373292043_A7400533.jpg",
  auto: "1788372914655_A7401960.jpg",
}

const categoriesList = CATEGORIES.map((c) => ({
  slug: c.slug,
  name: c.name,
  fallback: FALLBACKS[c.slug] || "",
}))

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
                <Image
                  src={`/api/photos/${image}`}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover md:grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 pointer-events-none select-none"
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
