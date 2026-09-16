"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

type CollabItem = {
  id: string
  name: string
  image: string | null
  description: string | null
  link: string | null
}

export default function CollaborationsSection({ items }: { items: CollabItem[] }) {
  const [active, setActive] = useState<CollabItem | null>(null)

  // Tant que Sofiane n'a ajouté aucune collaboration en admin, la section
  // reste invisible — pas de bloc vide sur le site.
  if (items.length === 0) return null

  return (
    <section className="py-32 px-4 md:px-8 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] text-zinc-400 uppercase tracking-[0.6em] font-bold">Ils m'ont fait confiance</span>
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">Collaborations</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className="group relative aspect-square overflow-hidden bg-zinc-900 border border-zinc-800 text-left cursor-pointer"
            >
              {item.image ? (
                <img
                  src={`/api/photos/${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover md:grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950"></div>
              )}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all duration-700"></div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="text-white text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-center group-hover:scale-110 transition-transform duration-700">
                  {item.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 md:p-12 text-center space-y-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {active.image && (
              <img
                src={`/api/photos/${active.image}`}
                alt={active.name}
                className="w-24 h-24 object-cover rounded-full mx-auto border border-zinc-800"
              />
            )}
            <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white italic">{active.name}</h3>
            {active.description && (
              <p className="text-zinc-400 text-sm leading-relaxed">{active.description}</p>
            )}
            {active.link && (
              <a
                href={active.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold text-white hover:text-zinc-300 transition"
              >
                Découvrir
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
          <button
            onClick={() => setActive(null)}
            className="absolute top-8 right-8 text-white text-3xl font-light"
          >
            &times;
          </button>
        </div>
      )}
    </section>
  )
}
