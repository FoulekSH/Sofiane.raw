"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const categories = ["Sport", "Portrait", "Événementiel", "Lifestyle", "Automobile", "Mariage", "Portfolio"]

export default function AdminPortfolio() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    const res = await fetch("/api/admin/portfolio")
    if (res.ok) {
      const data = await res.json()
      setPhotos(data)
    }
    setLoading(false)
  }

  const syncPhotos = async () => {
    setSyncing(true)
    const res = await fetch("/api/admin/portfolio/sync", { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      alert(`${data.added} nouvelles photos ajoutées.`)
      fetchPhotos()
    }
    setSyncing(false)
  }

  const updatePhoto = async (id: string, data: any) => {
    const res = await fetch("/api/admin/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data })
    })

    if (res.ok) {
      setPhotos(photos.map(p => p.id === id ? { ...p, ...data } : p))
    }
  }

  const deletePhoto = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette photo ?")) return

    const res = await fetch(`/api/admin/portfolio?id=${id}`, {
      method: "DELETE"
    })

    if (res.ok) {
      setPhotos(photos.filter(p => p.id !== id))
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light">Gestion du Portfolio Public</h2>
          <div className="text-zinc-500 text-sm">{photos.length} photos au total</div>
        </div>
        <button 
          onClick={syncPhotos}
          disabled={syncing}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition text-xs uppercase tracking-widest"
        >
          {syncing ? "Synchronisation..." : "Synchroniser public/photos"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {photos.map((photo) => (
          <motion.div 
            key={photo.id} 
            layout
            className={`relative group bg-zinc-900 border rounded-lg overflow-hidden transition-all ${photo.isPublic ? 'border-zinc-800' : 'border-red-900 opacity-60'}`}
          >
             <div className="aspect-square relative overflow-hidden">
               <img 
                 src={`/photos/${photo.filename}`} 
                 alt={photo.filename} 
                 className={`w-full h-full object-cover transition duration-300 ${photo.isPublic ? '' : 'grayscale'}`}
               />
               
               {/* Overlay Controls */}
               <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition p-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updatePhoto(photo.id, { isPublic: !photo.isPublic })}
                      className={`text-[9px] uppercase font-bold px-2 py-1 rounded border ${photo.isPublic ? 'border-green-500 text-green-500' : 'border-zinc-500 text-zinc-500'}`}
                    >
                      {photo.isPublic ? 'Public' : 'Masqué'}
                    </button>
                    
                    <button 
                      onClick={() => updatePhoto(photo.id, { isFeatured: !photo.isFeatured })}
                      className={`text-[9px] uppercase font-bold px-2 py-1 rounded border ${photo.isFeatured ? 'border-yellow-500 text-yellow-500' : 'border-zinc-500 text-zinc-500'}`}
                    >
                      {photo.isFeatured ? '★ Une' : 'Standard'}
                    </button>
                  </div>

                  <button 
                    onClick={() => deletePhoto(photo.id)}
                    className="text-[9px] uppercase font-bold text-red-500"
                  >
                    Supprimer
                  </button>
               </div>
             </div>

             {/* Bottom Info: Category Selection */}
             <div className="p-3 space-y-2">
                <select 
                  value={photo.category}
                  onChange={(e) => updatePhoto(photo.id, { category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 text-[10px] uppercase tracking-widest p-1.5 rounded text-zinc-400 focus:text-white transition"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="flex justify-between items-center text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                  <span>Ordre: {photo.order}</span>
                  <span className="truncate max-w-[80px]">{photo.filename}</span>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
