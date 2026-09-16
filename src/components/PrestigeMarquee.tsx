import Link from "next/link"
import { ArrowRight } from "lucide-react"

type PrestigePhoto = {
  id: string
  filename: string
  title: string | null
}

export default function PrestigeMarquee({ photos }: { photos: PrestigePhoto[] }) {
  // Rien à montrer tant qu'aucune photo n'est taguée "Prestige" en admin :
  // pas de bandeau vide ou cassé sur le site.
  if (photos.length === 0) return null

  // On duplique la liste pour boucler la piste en continu (translateX -50%).
  const track = [...photos, ...photos]

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-20 bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-end justify-between gap-8 mb-10">
        <div className="space-y-3">
          <span className="text-[10px] text-zinc-400 uppercase tracking-[0.6em] font-bold">Sélection</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white italic uppercase">Prestige</h2>
        </div>
        <Link
          href="/portfolio/prestige"
          className="hidden md:inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-white transition-colors flex-shrink-0"
        >
          Voir la collection
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative">
        {/* Fondus latéraux pour masquer les bords de la boucle */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10"></div>

        <div className="flex gap-4 w-max animate-marquee">
          {track.map((photo, i) => (
            <Link
              href="/portfolio/prestige"
              key={`${photo.id}-${i}`}
              className="group relative w-[220px] md:w-[300px] aspect-[4/5] flex-shrink-0 overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <img
                src={`/api/photos/${photo.filename}`}
                alt={photo.title || "Prestige"}
                className="w-full h-full object-cover md:grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105 pointer-events-none select-none"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 mt-8">
        <Link
          href="/portfolio/prestige"
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-white transition-colors"
        >
          Voir la collection
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
