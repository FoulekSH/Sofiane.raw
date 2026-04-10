"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const categories = [
  { name: "Sport", slug: "sport" },
  { name: "Portrait", slug: "portrait" },
  { name: "Événementiel", slug: "event" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Automobile", slug: "auto" },
  { name: "Mariage", slug: "mariage" },
]

export default function CategoryAdmin() {
  const [configs, setConfigs] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      alert(`Couverture mise à jour pour ${cat.name}`)
    }
  }

  if (loading) return <div className="text-white">Chargement...</div>

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-light italic">Configuration des Catégories</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const config = configs.find(c => c.slug === cat.slug)
          const catPhotos = photos.filter(p => p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase() === cat.slug)
          
          return (
            <div key={cat.slug} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="aspect-video relative bg-black">
                {config?.coverImage ? (
                  <img src={`/api/photos/${config.coverImage}`} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-widest">Aucune couverture</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold uppercase tracking-widest">{cat.name}</h3>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Choisir une image parmi {catPhotos.length} photos</p>
                
                <div className="grid grid-cols-4 gap-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {catPhotos.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => updateCategory(cat, p.filename)}
                      className={`aspect-square rounded border-2 transition-all overflow-hidden ${config?.coverImage === p.filename ? 'border-white scale-90' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={`/api/photos/${p.filename}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
