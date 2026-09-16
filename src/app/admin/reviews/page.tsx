"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Check, Star } from "lucide-react"

type ReviewItem = {
  id: string
  authorName: string
  rating: number
  text: string
  source: string | null
  order: number
  isPublic: boolean
}

const emptyForm = { authorName: "", rating: 5, text: "", source: "" }

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-amber-200">
          <Star size={16} fill={n <= value ? "currentColor" : "none"} className={n <= value ? "" : "text-zinc-700"} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsAdmin() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState<Record<string, "saving" | "saved" | "error">>({})

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/admin/reviews")
    if (res.ok) setItems((await res.json()).sort((a: ReviewItem, b: ReviewItem) => a.order - b.order))
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.authorName.trim() || !form.text.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/admin/reviews", {
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

  const updateItem = async (id: string, data: Record<string, unknown>) => {
    setStatus(prev => ({ ...prev, [id]: "saving" }))
    try {
      const res = await fetch("/api/admin/reviews", {
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
    if (!confirm("Supprimer cet avis ?")) return
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" })
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
    reordered.forEach((it, i) => { if (it.order !== i) updateItem(it.id, { order: i }) })
  }

  if (loading) return <div className="text-white">Chargement...</div>

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h2 className="text-2xl font-light italic">Avis clients</h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1">
          Recopiez ici les avis reçus (Google, Instagram, bouche-à-oreille...) — affichés en carrousel sur l'accueil
        </p>
      </div>

      <form onSubmit={handleCreate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm uppercase tracking-widest font-bold text-zinc-400">Ajouter un avis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Nom *</label>
            <input
              type="text"
              value={form.authorName}
              onChange={e => setForm({ ...form, authorName: e.target.value })}
              placeholder="Ex : Camille D."
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-sm text-white outline-none focus:border-white transition"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Note</label>
            <div className="py-3"><StarPicker value={form.rating} onChange={n => setForm({ ...form, rating: n })} /></div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Source (optionnel)</label>
            <input
              type="text"
              value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })}
              placeholder="Ex : Google, Instagram..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-sm text-white outline-none focus:border-white transition"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Avis *</label>
          <textarea
            value={form.text}
            onChange={e => setForm({ ...form, text: e.target.value })}
            rows={3}
            placeholder="Texte de l'avis..."
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-sm text-white outline-none focus:border-white transition resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !form.authorName.trim() || !form.text.trim()}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition disabled:opacity-50"
        >
          <Plus size={14} strokeWidth={3} />
          {creating ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-zinc-600 text-sm uppercase tracking-widest">Aucun avis pour l'instant.</p>
        )}
        {items.map((item, index) => {
          const itemStatus = status[item.id]
          return (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row gap-5">
              <div className="flex-grow space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    defaultValue={item.authorName}
                    onBlur={e => e.target.value !== item.authorName && updateItem(item.id, { authorName: e.target.value })}
                    className="bg-transparent text-white font-bold uppercase tracking-widest text-sm outline-none border-b border-transparent focus:border-white transition"
                  />
                  <StarPicker value={item.rating} onChange={n => updateItem(item.id, { rating: n })} />
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
                  defaultValue={item.text}
                  onBlur={e => e.target.value !== item.text && updateItem(item.id, { text: e.target.value })}
                  rows={2}
                  className="w-full bg-transparent text-zinc-400 text-sm outline-none border-b border-zinc-800 focus:border-white transition resize-none py-1"
                />

                <input
                  type="text"
                  defaultValue={item.source || ""}
                  onBlur={e => e.target.value !== (item.source || "") && updateItem(item.id, { source: e.target.value })}
                  placeholder="Source (Google, Instagram...)"
                  className="w-full max-w-xs bg-transparent text-zinc-500 text-xs outline-none border-b border-zinc-800 focus:border-white transition py-1"
                />

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
