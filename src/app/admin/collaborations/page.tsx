"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, ImageOff, Loader2, Check } from "lucide-react"

type Collaboration = {
  id: string
  name: string
  image: string | null
  description: string | null
  link: string | null
  order: number
  isPublic: boolean
}

const emptyForm = { name: "", description: "", link: "", image: "" }

export default function CollaborationsAdmin() {
  const [items, setItems] = useState<Collaboration[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState<Record<string, "saving" | "saved" | "error">>({})

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/admin/collaborations")
    if (res.ok) setItems((await res.json()).sort((a: Collaboration, b: Collaboration) => a.order - b.order))
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/collaborations/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert("Échec de l'upload : " + (err.error || res.status))
        return null
      }
      const data = await res.json()
      return data.filename as string
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/admin/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const created = await res.json()
        setItems(prev => [...prev, created])
        setForm(emptyForm)
      } else {
        const err = await res.json().catch(() => ({}))
        alert("Échec de la création : " + (err.error || res.status))
      }
    } finally {
      setCreating(false)
    }
  }

  const updateItem = async (id: string, data: Partial<Collaboration>) => {
    setStatus(prev => ({ ...prev, [id]: "saving" }))
    try {
      const res = await fetch("/api/admin/collaborations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data })
      })
      if (res.ok) {
        const updated = await res.json()
        setItems(prev => prev.map(it => it.id === id ? { ...it, ...updated } : it))
        setStatus(prev => ({ ...prev, [id]: "saved" }))
      } else {
        setStatus(prev => ({ ...prev, [id]: "error" }))
      }
    } catch {
      setStatus(prev => ({ ...prev, [id]: "error" }))
    } finally {
      setTimeout(() => setStatus(prev => { const r = { ...prev }; delete r[id]; return r }), 1500)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer cette collaboration ?")) return
    const res = await fetch(`/api/admin/collaborations?id=${id}`, { method: "DELETE" })
    if (res.ok) setItems(prev => prev.filter(it => it.id !== id))
  }

  const move = (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return
    const reordered = [...items]
    const tmp = reordered[index]
    reordered[index] = reordered[newIndex]
    reordered[newIndex] = tmp
    setItems(reordered)
    reordered.forEach((it, i) => {
      if (it.order !== i) updateItem(it.id, { order: i })
    })
  }

  if (loading) return <div className="text-white">Chargement...</div>

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h2 className="text-2xl font-light italic">Collaborations</h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">
          Marques / clients avec qui Sofiane a travaillé — affichés sur l'accueil du site public
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleCreate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm uppercase tracking-widest font-bold text-zinc-400">Ajouter une collaboration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Nom *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Turbo, Les Jumeaux..."
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-sm text-white outline-none focus:border-white transition"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Lien (optionnel)</label>
            <input
              type="text"
              value={form.link}
              onChange={e => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-sm text-white outline-none focus:border-white transition"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Description (optionnel)</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Détail affiché dans la fenêtre qui s'ouvre au clic..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-sm text-white outline-none focus:border-white transition resize-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Image (optionnel)</label>
          <div className="flex items-center gap-4">
            {form.image && (
              <img src={`/api/photos/${form.image}`} alt="" className="w-16 h-16 object-cover rounded border border-zinc-800" />
            )}
            <label className="bg-zinc-800 text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-zinc-700 transition">
              {uploading ? "Envoi..." : form.image ? "Changer l'image" : "Choisir une image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const filename = await uploadImage(file)
                  if (filename) setForm(f => ({ ...f, image: filename }))
                }}
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={creating || !form.name.trim()}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition disabled:opacity-50"
        >
          <Plus size={14} strokeWidth={3} />
          {creating ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {/* Liste */}
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-zinc-600 text-sm uppercase tracking-widest">Aucune collaboration pour l'instant.</p>
        )}
        {items.map((item, index) => {
          const itemStatus = status[item.id]
          return (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-28 h-28 flex-shrink-0 bg-black rounded-lg overflow-hidden border border-zinc-800 relative">
                {item.image ? (
                  <img src={`/api/photos/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <ImageOff size={18} />
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    defaultValue={item.name}
                    onBlur={e => e.target.value !== item.name && updateItem(item.id, { name: e.target.value })}
                    className="bg-transparent text-white font-bold uppercase tracking-widest text-sm outline-none border-b border-transparent focus:border-white transition"
                  />
                  {itemStatus && (
                    <span className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-full border ${
                      itemStatus === "error" ? "border-red-500 text-red-400" : itemStatus === "saved" ? "border-green-500 text-green-400" : "border-zinc-600 text-zinc-300"
                    }`}>
                      {itemStatus === "saving" && <Loader2 size={10} className="animate-spin" />}
                      {itemStatus === "saved" && <Check size={10} />}
                      {itemStatus === "saving" ? "Enregistrement" : itemStatus === "saved" ? "Enregistré" : "Échec"}
                    </span>
                  )}
                </div>

                <textarea
                  defaultValue={item.description || ""}
                  onBlur={e => e.target.value !== (item.description || "") && updateItem(item.id, { description: e.target.value })}
                  rows={2}
                  placeholder="Description..."
                  className="w-full bg-transparent text-zinc-400 text-sm outline-none border-b border-zinc-800 focus:border-white transition resize-none py-1"
                />

                <div className="flex items-center gap-2">
                  <LinkIcon size={12} className="text-zinc-600 flex-shrink-0" />
                  <input
                    type="text"
                    defaultValue={item.link || ""}
                    onBlur={e => e.target.value !== (item.link || "") && updateItem(item.id, { link: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-transparent text-zinc-500 text-xs outline-none border-b border-zinc-800 focus:border-white transition py-1"
                  />
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.isPublic}
                    onChange={e => updateItem(item.id, { isPublic: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950"
                  />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Visible sur le site</span>
                </label>
              </div>

              <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                <button onClick={() => move(index, -1)} disabled={index === 0} className="bg-zinc-800 text-zinc-400 p-2 rounded-full hover:text-white disabled:opacity-30 transition">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => move(index, 1)} disabled={index === items.length - 1} className="bg-zinc-800 text-zinc-400 p-2 rounded-full hover:text-white disabled:opacity-30 transition">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => deleteItem(item.id)} className="bg-red-900/50 text-red-500 p-2 rounded-full hover:bg-red-900 hover:text-white transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
