"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [viewingClient, setViewingClient] = useState<any>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: ""
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients")
    if (res.ok) setClients(await res.json())
  }

  const fetchClientDetails = async (id: string) => {
    const res = await fetch(`/api/admin/clients?id=${id}`)
    if (res.ok) setViewingClient(await res.json())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const method = editingClient ? "PATCH" : "POST"
    const body = editingClient ? { id: editingClient.id, ...formData } : formData

    try {
      const res = await fetch("/api/admin/clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setFormData({ name: "", email: "", phone: "", company: "", address: "", notes: "" })
        setEditingClient(null)
        fetchClients()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (client: any) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      notes: client.notes || ""
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteClient = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce client ?")) return
    const res = await fetch(`/api/admin/clients?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchClients()
    else {
      const data = await res.json()
      alert(data.error)
    }
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to add/edit client */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl sticky top-6 shadow-xl">
            <h2 className="text-xl font-light mb-6 italic text-white">
              {editingClient ? "Modifier le client" : "Ajouter un client"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Nom complet *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 rounded text-white focus:border-white transition"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 rounded text-white focus:border-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Téléphone</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 rounded text-white focus:border-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Entreprise</label>
                <input 
                  type="text" 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 rounded text-white focus:border-white transition"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Adresse légale</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 rounded text-white focus:border-white transition resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Notes Internes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Points particuliers à retenir..."
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2 rounded text-white focus:border-white transition resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-white text-black font-bold py-3 rounded-full hover:bg-zinc-200 transition text-sm uppercase tracking-widest"
                >
                  {loading ? "Chargement..." : editingClient ? "Mettre à jour" : "Enregistrer"}
                </button>
                {editingClient && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingClient(null)
                      setFormData({ name: "", email: "", phone: "", company: "", address: "", notes: "" })
                    }}
                    className="px-6 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition"
                  >
                    &times;
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List of clients */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">
                  <th className="px-6 py-5">Client</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-600 italic">Aucun client enregistré.</td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-zinc-800/30 transition duration-300 group">
                      <td className="px-6 py-5 cursor-pointer" onClick={() => fetchClientDetails(client.id)}>
                        <div className="font-medium text-zinc-200 group-hover:text-white transition">{client.name}</div>
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest">{client.company || "Particulier"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-zinc-400">{client.email || "-"}</div>
                        <div className="text-xs text-zinc-600">{client.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-5 text-right space-x-4">
                        <button 
                          onClick={() => startEdit(client)}
                          className="text-zinc-500 hover:text-white transition text-[10px] uppercase font-bold tracking-widest"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={() => deleteClient(client.id)}
                          className="text-red-900 hover:text-red-500 transition text-[10px] uppercase font-bold tracking-widest"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Client Detail View (History) */}
      <AnimatePresence>
        {viewingClient && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={() => setViewingClient(null)}
              className="absolute top-6 right-8 text-zinc-500 hover:text-white text-2xl"
            >
              &times;
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="space-y-6">
                  <div className="space-y-1">
                     <span className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-bold">Fiche Client</span>
                     <h3 className="text-3xl font-light text-white">{viewingClient.name}</h3>
                  </div>
                  <div className="space-y-4 text-sm text-zinc-400 font-light">
                     <p><strong>Entreprise:</strong> {viewingClient.company || "-"}</p>
                     <p><strong>Email:</strong> {viewingClient.email || "-"}</p>
                     <p><strong>Tél:</strong> {viewingClient.phone || "-"}</p>
                     <p><strong>Adresse:</strong> {viewingClient.address || "-"}</p>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded border border-zinc-800">
                     <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-2">Notes</p>
                     <p className="text-zinc-300 italic text-sm leading-relaxed">{viewingClient.notes || "Aucune note pour ce client."}</p>
                  </div>
               </div>

               <div className="md:col-span-2 space-y-8">
                  <h4 className="text-xl font-light text-white italic border-b border-zinc-800 pb-4">Historique des documents</h4>
                  <div className="space-y-4">
                     {viewingClient.invoices.length === 0 ? (
                       <p className="text-zinc-600 italic">Aucun document associé.</p>
                     ) : (
                       viewingClient.invoices.map((inv: any) => (
                         <div key={inv.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="space-y-1">
                               <p className="text-white font-medium">{inv.invoiceNum}</p>
                               <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{new Date(inv.issueDate).toLocaleDateString()} • {inv.type}</p>
                            </div>
                            <div className="text-right space-y-1">
                               <p className="text-white">{inv.totalAmount.toLocaleString()} €</p>
                               <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded">{inv.status}</span>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
