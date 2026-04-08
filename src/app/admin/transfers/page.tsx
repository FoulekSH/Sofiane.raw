"use client"

import { useState, useEffect } from "react"

export default function TransfersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [clientId, setClientId] = useState("")
  const [expirationDays, setExpirationDays] = useState("7")
  const [clients, setClients] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [newLink, setNewLink] = useState("")

  useEffect(() => {
    fetchClients()
    fetchTransfers()
  }, [])

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients")
    if (res.ok) setClients(await res.json())
  }

  const fetchTransfers = async () => {
    const res = await fetch("/api/admin/transfers")
    if (res.ok) setTransfers(await res.json())
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setMessage("")
    setNewLink("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("clientId", clientId)
    formData.append("expirationDays", expirationDays)

    try {
      const res = await fetch("/api/admin/transfers", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setMessage("Transfert généré avec succès.")
        setNewLink(data.url)
        setFile(null)
        fetchTransfers()
      } else {
        setMessage("Erreur lors de l'envoi.")
      }
    } catch (error) {
      setMessage("Erreur serveur.")
    } finally {
      setUploading(false)
    }
  }

  const deleteTransfer = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce transfert et son fichier associé ?")) return
    const res = await fetch(`/api/admin/transfers/${id}`, { method: "DELETE" })
    if (res.ok) fetchTransfers()
  }

  return (
    <div className="space-y-12">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-light mb-8 text-white italic">Nouveau transfert sécurisé</h2>
        
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 p-8 rounded-xl text-center hover:border-zinc-500 transition cursor-pointer relative">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
              <div className="space-y-2">
                <p className="text-white font-medium">{file ? file.name : "Cliquez ou glissez un fichier"}</p>
                <p className="text-xs text-zinc-600 uppercase tracking-widest">Zip, Raw, High-Res photos...</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Client</label>
                  <select 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white text-sm"
                  >
                    <option value="">Anonyme</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Validité (jours)</label>
                  <input 
                    type="number" 
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white text-sm"
                    min="1"
                    max="30"
                  />
               </div>
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className={`w-full bg-white text-black font-bold py-4 rounded-full transition duration-500 uppercase tracking-[0.2em] text-sm ${uploading ? 'opacity-50' : 'hover:scale-[1.02]'}`}
            >
              {uploading ? 'Chiffrage et envoi...' : 'Générer le lien RAW'}
            </button>
          </div>

          <div className="flex flex-col justify-center items-center bg-zinc-950 border border-zinc-900 rounded-2xl p-8 text-center min-h-[200px]">
            {newLink ? (
              <div className="space-y-6 animate-in fade-in duration-700 w-full">
                <p className="text-green-500 text-[10px] uppercase tracking-[0.4em] font-bold">Lien prêt à l'emploi</p>
                <div className="bg-zinc-900 p-4 border border-zinc-800 rounded font-mono text-xs text-blue-400 break-all select-all">
                  {newLink}
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(newLink); alert("Copié !"); }}
                  className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition font-bold"
                >
                  Copier dans le presse-papier
                </button>
              </div>
            ) : (
              <div className="space-y-2 opacity-30">
                <div className="text-4xl mb-4">☁</div>
                <p className="text-sm uppercase tracking-widest">En attente de fichier</p>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <h3 className="text-xl font-light p-6 border-b border-zinc-800 text-white italic">Gestion des partages actifs</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">
              <th className="px-6 py-5">Fichier</th>
              <th className="px-6 py-5 text-center">Downloads</th>
              <th className="px-6 py-5">Expire le</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic">Aucun transfert actif.</td>
              </tr>
            ) : (
              transfers.map((transfer) => {
                const isExpired = new Date(transfer.expiresAt) < new Date();
                return (
                  <tr key={transfer.id} className="hover:bg-zinc-800/30 transition duration-300 group">
                    <td className="px-6 py-5">
                      <p className="text-zinc-200 font-medium group-hover:text-white transition">{transfer.originalName}</p>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{transfer.client?.name || "Anonyme"}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="text-white bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-full text-xs font-bold">{transfer.downloads}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`text-xs uppercase font-bold tracking-widest ${isExpired ? 'text-red-900' : 'text-zinc-500'}`}>
                        {new Date(transfer.expiresAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => deleteTransfer(transfer.id)}
                        className="text-red-900 hover:text-red-500 transition text-[10px] uppercase font-bold tracking-widest"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
