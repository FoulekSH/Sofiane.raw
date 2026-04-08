"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function AdminPortfolio() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const toggleStatus = async (id: string, field: string, currentValue: boolean) => {
    const res = await fetch("/api/admin/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: !currentValue })
    })

    if (res.ok) {
      setPhotos(photos.map(p => p.id === id ? { ...p, [field]: !currentValue } : p))
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
        <h2 className="text-2xl font-light">Gestion du Portfolio Public</h2>
        <div className="text-zinc-500 text-sm">{photos.length} photos au total</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {photos.map((photo, index) => (
          <motion.div 
            key={photo.id} 
            layout
            className={`relative group aspect-square bg-zinc-900 border rounded-lg overflow-hidden transition-all ${photo.isPublic ? 'border-zinc-800' : 'border-red-900 opacity-60'}`}
          >
             <img 
               src={`/photos/${photo.filename}`} 
               alt={photo.filename} 
               className={`w-full h-full object-cover transition duration-300 ${photo.isPublic ? '' : 'grayscale'}`}
             />
             
             {/* Overlay Controls */}
             <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition p-2">
                <button 
                  onClick={() => toggleStatus(photo.id, "isPublic", photo.isPublic)}
                  className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${photo.isPublic ? 'border-green-500 text-green-500' : 'border-zinc-500 text-zinc-500'}`}
                >
                  {photo.isPublic ? 'Visible' : 'Masquée'}
                </button>
                
                <button 
                  onClick={() => toggleStatus(photo.id, "isFeatured", photo.isFeatured)}
                  className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${photo.isFeatured ? 'border-yellow-500 text-yellow-500' : 'border-zinc-500 text-zinc-500'}`}
                >
                  {photo.isFeatured ? '★ Featured' : 'Standard'}
                </button>

                <button 
                  onClick={() => deletePhoto(photo.id)}
                  className="text-[10px] uppercase font-bold text-red-500 mt-2"
                >
                  Supprimer
                </button>
             </div>
             
             {/* Order Badge */}
             <div className="absolute top-2 left-2 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded backdrop-blur-sm">
                #{photo.order}
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
