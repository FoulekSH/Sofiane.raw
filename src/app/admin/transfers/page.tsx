"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [files, setFiles] = useState<FileList | null>(null)
  const [clientId, setClientId] = useState("")
  const [expirationDays, setExpirationDays] = useState("7")
  const [password, setPassword] = useState("")

  useEffect(() => {
    fetchTransfers()
    fetchClients()
  }, [])

  const fetchTransfers = async () => {
    const res = await fetch("/api/admin/transfers")
    if (res.ok) setTransfers(await res.json())
  }

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients")
    if (res.ok) setClients(await res.json())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return
    setUploading(true)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i])
    }
    formData.append("clientId", clientId)
    formData.append("expirationDays", expirationDays)
    formData.append("password", password)

    try {
      const res = await fetch("/api/admin/transfers", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        setShowForm(false)
        setFiles(null)
        setPassword("")
        fetchTransfers()
      } else {
        const error = await res.json()
        alert(error.error || "Erreur lors de l'upload")
      }
    } catch (error) {
      console.error(error)
      alert("Erreur de connexion")
    } finally {
      setUploading(false)
    }
  }

  const updateTransfer = async (id: string, data: any) => {
    const res = await fetch("/api/admin/transfers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data })
    })
    if (res.ok) {
      fetchTransfers()
      setEditingId(null)
    }
  }

  const deleteTransfer = async (id: string) => {
    if (!confirm("Supprimer ce transfert ?")) return
    const res = await fetch(`/api/admin/transfers?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchTransfers()
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/dl/${token}`
    navigator.clipboard.writeText(url)
    alert("Lien copié !")
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light italic">Transferts de Fichiers</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition text-xs uppercase tracking-widest"
        >
          {showForm ? "Fermer" : "Nouveau Transfert"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Fichiers (Multiples autorisés, Max 10Go)</label>
                    <input 
                      type="file" 
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white text-xs"
                      required
                    />
                    {files && (
                      <p className="text-[10px] text-zinc-500 italic">
                        {files.length} fichier(s) sélectionné(s) ({(Array.from(files).reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Client (Optionnel)</label>
                    <select 
                      value={clientId} 
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white text-xs"
                    >
                      <option value="">Sélectionner</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Expiration (jours)</label>
                    <input 
                      type="number" 
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Mot de passe (Optionnel)</label>
                    <input 
                      type="text" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Laisser vide pour aucun"
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white text-xs"
                    />
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={uploading}
                 className="w-full bg-white text-black py-4 rounded-full font-bold hover:bg-zinc-200 transition uppercase tracking-widest text-xs"
               >
                 {uploading ? "Transfert en cours..." : "Créer le transfert"}
               </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">
              <th className="px-6 py-5">Fichiers</th>
              <th className="px-6 py-5">Client / Expire le</th>
              <th className="px-6 py-5 text-center">DLs</th>
              <th className="px-6 py-5 text-center">Sécu</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transfers.map((t) => {
              const totalSize = t.files?.reduce((sum: number, f: any) => sum + f.size, 0) || 0;
              return (
              <tr key={t.id} className="hover:bg-zinc-800/30 transition group">
                <td className="px-6 py-5">
                  <p className="text-zinc-200 font-medium">{t.files?.length || 0} fichier(s)</p>
                  <p className="text-[10px] text-zinc-600">{(totalSize / 1024 / 1024).toFixed(2)} MB</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.files?.slice(0, 3).map((f: any) => (
                      <span key={f.id} className="text-[8px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 truncate max-w-[120px]">
                        {f.originalName}
                      </span>
                    ))}
                    {t.files?.length > 3 && <span className="text-[8px] text-zinc-600 font-bold">+{t.files.length - 3} plus</span>}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-zinc-400 text-sm">{t.client?.name || "Public"}</p>
                  {editingId === t.id ? (
                    <input 
                      type="date"
                      defaultValue={new Date(t.expiresAt).toISOString().split('T')[0]}
                      onChange={(e) => updateTransfer(t.id, { expiresAt: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 text-[10px] p-1 rounded mt-1"
                    />
                  ) : (
                    <p className={`text-[10px] uppercase tracking-widest ${new Date(t.expiresAt) < new Date() ? 'text-red-500' : 'text-zinc-600'}`}>
                      {new Date(t.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-zinc-500 font-mono">{t.downloads}</span>
                </td>
                <td className="px-6 py-5 text-center">
                  {editingId === t.id ? (
                    <input 
                      type="text"
                      placeholder="MDP"
                      defaultValue={t.password || ""}
                      onBlur={(e) => updateTransfer(t.id, { password: e.target.value || null })}
                      className="bg-zinc-950 border border-zinc-800 text-[10px] p-1 w-20 rounded"
                    />
                  ) : (
                    <span className={`text-[10px] font-bold ${t.password ? 'text-amber-500' : 'text-zinc-700'}`}>
                      {t.password ? "Cadenas" : "Libre"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right space-x-4">
                  <button 
                    onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                    className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => copyLink(t.token)}
                    className="text-[10px] uppercase font-bold text-zinc-300 hover:text-white"
                  >
                    Lien
                  </button>
                  <button 
                    onClick={() => deleteTransfer(t.id)}
                    className="text-[10px] uppercase font-bold text-red-900 hover:text-red-500"
                  >
                    Suppr
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}
