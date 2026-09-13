"use client"

import { useState, useEffect } from "react"
import { Check, Loader2, ImageOff } from "lucide-react"
import { CATEGORIES, photoInCategory } from "@/lib/categories"

const categories = CATEGORIES

export default function CategoryAdmin() {
  const [configs, setConfigs] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // slug -> "saving" pendant la requête, "saved" juste après (toast discret), ou absent
  const [status, setStatus] = useState<Record<string, "saving" | "saved" | "error">>({})

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then(res => res.json()),
      fetch("/api/admin/portfolio").then(res => res.json())
    ]).then(([configsData, photosData]) => {
      setConfigs(configsData)
      setPhotos(photosData)
      setLoading(false)
    })
  }, [])

  const updateCategory = async (cat: any, coverImage: string) => {
    if (status[cat.slug] === "saving") return
    setStatus(prev => ({ ...prev, [cat.slug]: "saving" }))

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          coverImage
        })
      })

      if (res.ok) {
        const newConfig = await res.json()
        setConfigs(prev => {
          const index = prev.findIndex(c => c.slug === cat.slug)
          if (index > -1) {
            const updated = [...prev]
            updated[index] = newConfig
            return updated
          }
          return [...prev, newConfig]
        })
        setStatus(prev => ({ ...prev, [cat.slug]: "saved" }))
      } else {
        setStatus(prev => ({ ...prev, [cat.slug]: "error" }))
      }
    } catch {
      setStatus(prev => ({ ...prev, [cat.slug]: "error" }))
    } finally {
      setTimeout(() => {
        setStatus(prev => {
          const rest = { ...prev }
          delete rest[cat.slug]
          return rest
        })
      }, 1800)
    }
  }

  if (loading) return <div className="text-white">Chargement...</div>

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-light italic">Configuration des Catégories</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const config = configs.find(c => c.slug === cat.slug)

          // Une photo peut appartenir à plusieurs catégories ("Mode / Éditorial, Sport").
          const matched = photos.filter(p => photoInCategory(p.category, cat))
          // Si aucune photo n'est encore rangée dans cette catégorie, on laisse
          // quand même choisir une couverture parmi toutes les photos.
          const catPhotos = matched.length > 0 ? matched : photos
          const usingAllPhotos = matched.length === 0
          const catStatus = status[cat.slug]

          return (
            <div key={cat.slug} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-black/20">
              {/* Astuce padding-top au lieu de aspect-video/aspect-square : garantit un
                  ratio fixe quel que soit le support de la propriété CSS aspect-ratio,
                  et évite tout affaissement/chevauchement des vignettes. */}
              <div className="relative w-full bg-black" style={{ paddingTop: "42%" }}>
                {config?.coverImage ? (
                  <img
                    src={`/api/photos/${config.coverImage}`}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <ImageOff size={20} />
                    <span className="text-[10px] uppercase tracking-widest">Aucune couverture</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                  <h3 className="text-white font-bold uppercase tracking-widest drop-shadow">{cat.name}</h3>
                  {catStatus && (
                    <span
                      className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-full backdrop-blur-md border ${
                        catStatus === "error"
                          ? "border-red-500 text-red-400 bg-red-500/10"
                          : catStatus === "saved"
                          ? "border-green-500 text-green-400 bg-green-500/10"
                          : "border-zinc-600 text-zinc-300 bg-zinc-800/60"
                      }`}
                    >
                      {catStatus === "saving" && <Loader2 size={10} className="animate-spin" />}
                      {catStatus === "saved" && <Check size={10} />}
                      {catStatus === "saving" ? "Enregistrement" : catStatus === "saved" ? "Enregistré" : "Échec"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-grow flex flex-col">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  {usingAllPhotos
                    ? `Aucune photo dans cette catégorie — choisir parmi toutes (${catPhotos.length})`
                    : `Choisir une image parmi ${catPhotos.length} photos`}
                </p>

                <div
                  className="grid gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar content-start"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}
                >
                  {catPhotos.map(p => {
                    const isSelected = config?.coverImage === p.filename
                    return (
                      <button
                        key={p.id}
                        onClick={() => updateCategory(cat, p.filename)}
                        disabled={catStatus === "saving"}
                        title={p.title || p.filename}
                        className={`group relative block w-full overflow-hidden rounded-xl ring-2 transition-shadow disabled:cursor-wait ${
                          isSelected ? "ring-white" : "ring-transparent hover:ring-zinc-500"
                        }`}
                        style={{ paddingTop: "100%" }}
                      >
                        <img
                          src={`/api/photos/${p.filename}`}
                          alt={p.title || p.filename}
                          className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
                            isSelected ? "opacity-100" : "opacity-55 group-hover:opacity-100 group-hover:scale-110"
                          }`}
                        />
                        {isSelected && (
                          <span className="absolute top-1 right-1 flex items-center justify-center bg-white text-black rounded-full p-1 shadow">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
