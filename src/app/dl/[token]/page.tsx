"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function DownloadPage() {
  const { token } = useParams()
  const [transfer, setTransfer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/transfers/info/${token}`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur serveur ou transfert introuvable")
        return res.json()
      })
      .then(data => {
        setTransfer(data)
        if (!data.password) setIsUnlocked(true)
        if (data.files) setSelectedFiles(data.files.map((f: any) => f.id))
        setLoading(false)
      })
      .catch(err => {
        console.error("Fetch error:", err)
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === transfer.password) {
      setIsUnlocked(true)
      setError("")
    } else {
      setError("Mot de passe incorrect")
    }
  }

  const toggleFile = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const downloadZip = () => {
    if (selectedFiles.length === 0) return
    const link = document.createElement("a")
    link.href = `/api/transfers/download/${token}/zip?fileIds=${selectedFiles.join(",")}`
    link.download = "" 
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllIndividual = () => {
    if (selectedFiles.length > 5) {
      if (!confirm(`Attention : Votre navigateur va demander une autorisation pour chacun des ${selectedFiles.length} fichiers. Sur iPhone, il est fortement recommandé d'utiliser le bouton "ZIP" à la place. Continuer ?`)) return
    }
    
    selectedFiles.forEach((fileId, index) => {
      setTimeout(() => {
        const link = document.createElement("a")
        link.href = `/api/transfers/download/${token}?fileId=${fileId}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 1000) // 1 seconde d'intervalle pour limiter les blocages Safari
    })
  }

  const downloadOne = (fileId: string) => {
    const link = document.createElement("a")
    link.href = `/api/transfers/download/${token}?fileId=${fileId}`
    link.click()
  }

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Chargement...</div>
  if (!transfer) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Transfert introuvable</div>

  const isExpired = new Date(transfer.expiresAt) < new Date()
  const totalSize = transfer.files?.reduce((sum: number, f: any) => sum + f.size, 0) || 0

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-white">SOFIANE <span className="font-black italic">RAW</span></h1>
          <div className="h-px w-12 bg-zinc-700 mx-auto"></div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Secure Delivery System</p>
        </div>

        {isExpired ? (
          <div className="py-12 space-y-6">
            <div className="text-red-500/20 text-8xl">⚠</div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-widest">Lien expiré</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">Ce lien de téléchargement n'est plus valide.<br />Merci de contacter le studio pour un nouvel accès.</p>
            </div>
          </div>
        ) : !isUnlocked ? (
          <form onSubmit={handleUnlock} className="py-10 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-lg font-bold uppercase tracking-widest">Accès Protégé</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Veuillez saisir le mot de passe pour accéder aux fichiers</p>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="MOT DE PASSE"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center text-sm tracking-widest focus:border-white transition-all outline-none"
                required
              />
              {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-[0.2em] text-xs shadow-xl"
              >
                Déverrouiller
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="py-4 border-y border-zinc-800/50 space-y-2">
              <p className="text-zinc-500 text-[9px] uppercase tracking-[0.3em] font-bold">Destinataire</p>
              <div className="text-2xl font-light tracking-tight">{transfer.client?.name || "Client Privé"}</div>
              <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest italic">Expire le {new Date(transfer.expiresAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-4 text-left">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{transfer.files?.length} Fichier(s) • {(totalSize / 1024 / 1024).toFixed(2)} MB</h3>
                  <button 
                    onClick={() => setSelectedFiles(selectedFiles.length === transfer.files.length ? [] : transfer.files.map((f: any) => f.id))}
                    className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-white transition"
                  >
                    {selectedFiles.length === transfer.files.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
               </div>

               <div className="bg-zinc-950 rounded-2xl border border-zinc-800/50 divide-y divide-zinc-900 overflow-hidden">
                  {transfer.files?.map((file: any) => (
                    <div key={file.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition group">
                       <div className="flex items-center gap-4 flex-1 min-w-0">
                          <input 
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => toggleFile(file.id)}
                            className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-white focus:ring-0"
                          />
                          <div className="truncate pr-4">
                             <p className="text-xs font-bold text-white truncate uppercase tracking-widest">{file.originalName}</p>
                             <p className="text-[9px] text-zinc-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => downloadOne(file.id)}
                         className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={downloadZip}
                disabled={selectedFiles.length === 0}
                className="bg-white text-black font-black py-5 rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-[10px] shadow-2xl"
              >
                Tout Télécharger (ZIP)
              </button>
              <button 
                onClick={downloadAllIndividual}
                disabled={selectedFiles.length === 0}
                className="bg-zinc-800 text-white font-black py-5 rounded-2xl hover:bg-zinc-700 disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-[10px] border border-zinc-700"
              >
                Tout Télécharger (Solo)
              </button>
            </div>
            <p className="text-zinc-600 text-[8px] uppercase tracking-widest font-bold mt-4">
               Conseil : Utilisez le format ZIP sur iPhone pour éviter les blocages de sécurité.
            </p>
          </div>
        )}

        <div className="pt-8 text-zinc-700 text-[8px] uppercase tracking-[0.4em] font-bold border-t border-zinc-800/30">
          © {new Date().getFullYear()} Sofiane Raw Studio • Prestige Photography
        </div>
      </div>
    </div>
  )
}
