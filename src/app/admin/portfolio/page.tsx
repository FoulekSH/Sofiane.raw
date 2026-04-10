"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const categories = ["Sport", "Portrait", "Événementiel", "Lifestyle", "Automobile", "Mariage", "Portfolio"]

export default function AdminPortfolio() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [bulkCategory, setBulkCategory] = useState("")

  const fetchPhotos = useCallback(async () => {
    const res = await fetch("/api/admin/portfolio")
    if (res.ok) {
      const data = await res.json()
      setPhotos(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true)
    setUploadProgress(10)
    
    const formData = new FormData()
    for (const file of Array.from(files)) {
      formData.append("files", file)
    }

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => prev < 90 ? prev + 5 : prev)
      }, 200)

      const res = await fetch("/api/admin/portfolio/upload", {
        method: "POST",
        body: formData,
      })
      
      clearInterval(interval)
      setUploadProgress(100)

      if (res.ok) {
        setTimeout(() => {
          setUploading(false)
          setUploadProgress(0)
          fetchPhotos()
        }, 500)
      } else {
        const err = await res.json()
        alert("Erreur upload: " + err.error)
        setUploading(false)
      }
    } catch (error) {
      console.error("Upload error", error)
      setUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files)
    }
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

  const bulkUpdate = async (data: any) => {
    if (selectedIds.length === 0) return
    const res = await fetch("/api/admin/portfolio/bulk-update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, data })
    })

    if (res.ok) {
      setPhotos(photos.map(p => selectedIds.includes(p.id) ? { ...p, ...data } : p))
      if (data.category) setBulkCategory("")
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Voulez-vous vraiment supprimer ces ${selectedIds.length} photos ?`)) return

    const res = await fetch(`/api/admin/portfolio?ids=${selectedIds.join(",")}`, {
      method: "DELETE"
    })

    if (res.ok) {
      setPhotos(photos.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selectAll = () => {
    if (selectedIds.length === photos.length && photos.length > 0) setSelectedIds([])
    else setSelectedIds(photos.map(p => p.id))
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div 
      className="space-y-8 min-h-screen pb-40"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light italic">Gestion du Portfolio</h2>
          <div className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{photos.length} photos au total</div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={selectAll}
            className="bg-zinc-800 text-white px-6 py-2 rounded-full font-bold hover:bg-zinc-700 transition text-[10px] uppercase tracking-widest"
          >
            {selectedIds.length === photos.length && photos.length > 0 ? "Désélectionner Tout" : "Sélectionner Tout"}
          </button>

          <button 
            onClick={syncPhotos}
            disabled={syncing}
            className="bg-zinc-800 text-white px-6 py-2 rounded-full font-bold hover:bg-zinc-700 transition text-[10px] uppercase tracking-widest"
          >
            {syncing ? "Scanner..." : "Scanner Serveur"}
          </button>

          <label className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition text-[10px] uppercase tracking-widest cursor-pointer">
            {uploading ? "Envoi..." : "Ajouter Photos"}
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              accept="image/*"
            />
          </label>
        </div>
      </div>

      {/* Barre d'actions groupées */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 border border-zinc-700 p-4 rounded-3xl shadow-2xl flex flex-wrap items-center gap-4"
          >
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 px-2">{selectedIds.length} sélectionnées</span>
            
            <div className="h-4 w-px bg-zinc-700"></div>

            <select 
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-[9px] uppercase tracking-widest p-2 rounded text-white outline-none"
            >
              <option value="">Catégorie</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button 
              onClick={() => bulkUpdate({ category: bulkCategory })}
              disabled={!bulkCategory}
              className="bg-white text-black px-3 py-2 rounded text-[9px] uppercase font-bold tracking-widest disabled:opacity-50"
            >
              Appliquer
            </button>

            <div className="flex gap-1">
               <button 
                 onClick={() => bulkUpdate({ showOnHomePage: true })}
                 className="bg-zinc-800 text-zinc-300 px-3 py-2 rounded text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-700"
               >
                 Main On
               </button>
               <button 
                 onClick={() => bulkUpdate({ showOnHomePage: false })}
                 className="bg-zinc-800 text-zinc-500 px-3 py-2 rounded text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-700"
               >
                 Main Off
               </button>
            </div>

            <div className="flex gap-1">
               <button 
                 onClick={() => bulkUpdate({ isPublic: true })}
                 className="bg-zinc-800 text-green-500 px-3 py-2 rounded text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-700"
               >
                 Public
               </button>
               <button 
                 onClick={() => bulkUpdate({ isPublic: false })}
                 className="bg-zinc-800 text-red-500 px-3 py-2 rounded text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-700"
               >
                 Masquer
               </button>
            </div>

            <button 
              onClick={deleteSelected}
              className="bg-red-900 text-white px-4 py-2 rounded-full font-bold hover:bg-red-700 transition text-[9px] uppercase tracking-widest"
            >
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {photos.map((photo) => (
          <motion.div 
            key={photo.id} 
            layout
            className={`relative group bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300 ${selectedIds.includes(photo.id) ? 'ring-2 ring-white border-white' : (photo.isPublic ? 'border-zinc-800' : 'border-red-900/50 opacity-80')}`}
          >
             <div className="aspect-[4/5] relative overflow-hidden bg-black">
               <img 
                 src={`/api/photos/${photo.filename}`} 
                 alt={photo.filename} 
                 className={`w-full h-full object-cover transition duration-700 ${photo.isPublic ? '' : 'grayscale opacity-50'} ${selectedIds.includes(photo.id) ? 'opacity-40 scale-95' : 'group-hover:scale-110'}`}
                 onClick={() => toggleSelect(photo.id)}
               />
               
               <div className={`absolute top-3 left-3 z-20`}>
                 <input 
                   type="checkbox" 
                   checked={selectedIds.includes(photo.id)}
                   onChange={() => toggleSelect(photo.id)}
                   className="w-5 h-5 rounded border-zinc-800 bg-zinc-950/50 text-white focus:ring-0 cursor-pointer backdrop-blur-md"
                 />
               </div>

               <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[8px] text-white px-2 py-1 rounded font-bold uppercase tracking-widest z-10 border border-white/10 flex items-center gap-2">
                 <span>ORDRE</span>
                 <input 
                   type="number"
                   value={photo.order}
                   onChange={(e) => updatePhoto(photo.id, { order: parseInt(e.target.value) })}
                   className="w-10 bg-transparent border-none p-0 text-center font-black outline-none focus:text-white"
                   onClick={(e) => e.stopPropagation()}
                 />
               </div>

               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                  <div className="flex gap-1 justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updatePhoto(photo.id, { isPublic: !photo.isPublic }); }}
                      className={`text-[8px] uppercase font-bold px-2 py-1 rounded border transition-colors ${photo.isPublic ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}
                    >
                      {photo.isPublic ? 'Public' : 'Masqué'}
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); updatePhoto(photo.id, { showOnHomePage: !photo.showOnHomePage }); }}
                      className={`text-[8px] uppercase font-bold px-2 py-1 rounded border transition-colors ${photo.showOnHomePage ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-zinc-500 text-zinc-500 bg-zinc-500/10'}`}
                    >
                      {photo.showOnHomePage ? 'Accueil On' : 'Accueil Off'}
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); updatePhoto(photo.id, { isFeatured: !photo.isFeatured }); }}
                      className={`text-[8px] uppercase font-bold px-2 py-1 rounded border transition-colors ${photo.isFeatured ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-zinc-500 text-zinc-500 bg-zinc-500/10'}`}
                    >
                      {photo.isFeatured ? 'Une' : 'Std'}
                    </button>
                  </div>
               </div>
             </div>

             <div className="p-3 bg-zinc-950/50 backdrop-blur-sm border-t border-zinc-800">
                <select 
                  value={photo.category}
                  onChange={(e) => updatePhoto(photo.id, { category: e.target.value })}
                  className="w-full bg-transparent text-[9px] uppercase tracking-widest py-1 rounded text-zinc-500 font-bold outline-none cursor-pointer"
                >
                  {categories.map(cat => <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>)}
                </select>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
