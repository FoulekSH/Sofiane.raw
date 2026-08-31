"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ClientItem = {
  id: string
  name: string
}

type TransferFileItem = {
  id: string
  originalName: string
  size: number
}

type TransferItem = {
  id: string
  token: string
  expiresAt: string
  password?: string | null
  downloads: number
  client?: {
    name?: string
  }
  files?: TransferFileItem[]
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferItem[]>([])
  const [clients, setClients] = useState<ClientItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadEta, setUploadEta] = useState<string>("")
  const [uploadSpeed, setUploadSpeed] = useState<string>("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const uploadStartRef = useRef<number | null>(null)

  // Form State
  const [files, setFiles] = useState<FileList | null>(null)
  const [clientId, setClientId] = useState("")
  const [expirationDays, setExpirationDays] = useState("7")
  const [password, setPassword] = useState("")

  const fetchTransfers = async () => {
    const res = await fetch("/api/admin/transfers")
    if (res.ok) setTransfers(await res.json())
  }

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients")
    if (res.ok) setClients(await res.json())
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchTransfers(), fetchClients()])
    }

    void loadInitialData()
  }, [])

  const formatBytes = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return "0 KB"
    const units = ["B", "KB", "MB", "GB"]
    let size = value
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex += 1
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
  }

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "Calcul..."

    const totalSeconds = Math.max(1, Math.round(seconds))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const totalSelectedSize = files ? Array.from(files).reduce((sum, file) => sum + file.size, 0) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    const totalBytes = Array.from(files).reduce((sum, file) => sum + file.size, 0)

    uploadStartRef.current = Date.now()
    setUploading(true)
    setUploadProgress(0)
    setUploadEta("Calcul du temps restant...")
    setUploadSpeed("")

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i])
    }
    formData.append("clientId", clientId)
    formData.append("expirationDays", expirationDays)
    formData.append("password", password)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr
    xhr.open("POST", "/api/admin/transfers", true)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !totalBytes) return

      const loaded = event.loaded
      const percentComplete = Math.min(Math.round((loaded / event.total) * 100), 100)
      const elapsedMs = Date.now() - (uploadStartRef.current ?? Date.now())
      const uploadSpeedBytes = elapsedMs > 0 ? loaded / (elapsedMs / 1000) : 0
      const remainingBytes = Math.max(event.total - loaded, 0)
      const etaSeconds = uploadSpeedBytes > 0 ? remainingBytes / uploadSpeedBytes : 0

      setUploadProgress(percentComplete)
      setUploadSpeed(`${formatBytes(uploadSpeedBytes)}/s`)
      setUploadEta(`${formatDuration(etaSeconds)} restantes`)
    }

    xhr.onload = () => {
      setUploading(false)
      setUploadEta("")
      setUploadSpeed("")
      if (xhr.status === 200) {
        setShowForm(false)
        setFiles(null)
        setPassword("")
        setUploadProgress(0)
        fetchTransfers()
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          alert(error.error || "Erreur lors de l'upload")
        } catch {
          alert("Erreur lors de l'upload")
        }
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      setUploadEta("")
      setUploadSpeed("")
      alert("Erreur de connexion")
    }

    xhr.onabort = () => {
      setUploading(false)
      setUploadProgress(0)
      setUploadEta("")
      setUploadSpeed("")
    }

    xhr.send(formData)
  }

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
  }

  const updateTransfer = async (id: string, data: { expiresAt?: string; password?: string | null }) => {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light italic">Transferts de Fichiers</h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-1 max-w-xl">
            Partagez vos photos et vidéos à vos clients de manière sécurisée et rapide via un lien unique.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition text-xs uppercase tracking-widest whitespace-nowrap"
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

               {uploading ? (
                 <div className="rounded-2xl border border-zinc-700 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 p-5">
                   <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                     <div>
                       <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Transfert en cours</p>
                       <p className="mt-3 text-4xl md:text-5xl font-black tracking-[-0.08em] text-white">{uploadProgress}%</p>
                     </div>
                     <div className="text-left sm:text-right text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                       <div>{uploadSpeed || "Vitesse..."}</div>
                       <div className="mt-2">{uploadEta || "Calcul du temps restant..."}</div>
                     </div>
                   </div>

                   <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                     <div
                       className="h-full rounded-full bg-gradient-to-r from-white via-zinc-300 to-zinc-500 transition-all duration-300 ease-out"
                       style={{ width: `${uploadProgress}%` }}
                     />
                   </div>

                   <div className="mt-4 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                     <span>{totalSelectedSize > 0 ? formatBytes(totalSelectedSize) : "0 MB"}</span>
                     <span>{files ? Array.from(files).length : 0} fichier(s)</span>
                   </div>
                 </div>
               ) : (
                 <div className="flex gap-2">
                   <button 
                     type="submit" 
                     disabled={uploading}
                     className="flex-1 bg-white text-black py-4 rounded-full font-bold hover:bg-zinc-200 transition uppercase tracking-widest text-xs relative overflow-hidden"
                   >
                     <span className="relative z-10">Créer le transfert</span>
                   </button>
                 </div>
               )}

               {uploading && (
                 <div className="flex justify-end">
                   <button
                     type="button"
                     onClick={handleCancel}
                     className="px-6 bg-red-900 text-white rounded-full font-bold hover:bg-red-700 transition uppercase tracking-widest text-xs"
                   >
                     Annuler
                   </button>
                 </div>
               )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
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
              const totalSize = t.files?.reduce((sum: number, f: TransferFileItem) => sum + f.size, 0) || 0
              return (
              <tr key={t.id} className="hover:bg-zinc-800/30 transition group">
                <td className="px-6 py-5">
                  <p className="text-zinc-200 font-medium">{t.files?.length || 0} fichier(s)</p>
                  <p className="text-[10px] text-zinc-600">{(totalSize / 1024 / 1024).toFixed(2)} MB</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.files?.slice(0, 3).map((f: TransferFileItem) => (
                      <span key={f.id} className="text-[8px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 truncate max-w-[120px]">
                        {f.originalName}
                      </span>
                    ))}
                    {t.files && t.files.length > 3 && <span className="text-[8px] text-zinc-600 font-bold">+{t.files.length - 3} plus</span>}
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
