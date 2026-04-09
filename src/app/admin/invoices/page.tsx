"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Filters & Search
  const [search, setSearch] = useState("")
  const [filterClientId, setFilterClientId] = useState("")

  // Form State
  const [formData, setFormData] = useState({
    clientId: "",
    type: "INVOICE",
    invoiceNum: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    address: "",
    vatRate: 20.0,
    status: "DRAFT"
  })
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }])

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [filterClientId, search])

  const fetchInvoices = async () => {
    const params = new URLSearchParams()
    if (filterClientId) params.append("clientId", filterClientId)
    if (search) params.append("search", search)
    const res = await fetch(`/api/admin/invoices?${params.toString()}`)
    if (res.ok) setInvoices(await res.json())
  }

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients")
    if (res.ok) setClients(await res.json())
  }

  // Auto-generate invoice number & address
  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c.id === formData.clientId)
      if (client) {
        setFormData(prev => {
          // Only auto-gen invoice num if it's empty
          let newNum = prev.invoiceNum
          if (!newNum) {
            const prefix = client.name.substring(0, 3).toUpperCase()
            const year = new Date().getFullYear()
            const random = Math.floor(1000 + Math.random() * 9000)
            const typePrefix = prev.type === "QUOTE" ? "DEV" : "FAC"
            newNum = `${typePrefix}-${prefix}-${year}-${random}`
          }
          return { ...prev, invoiceNum: newNum, address: client.address || "" }
        })
      }
    }
  }, [formData.clientId, formData.type, clients])

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0 }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    ;(newItems[index] as any)[field] = value
    setItems(newItems)
  }

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
  const vatAmount = (subtotal * formData.vatRate) / 100
  const totalAmount = subtotal + vatAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          vatAmount,
          totalAmount,
          items
        })
      })

      if (res.ok) {
        setShowForm(false)
        setItems([{ description: "", quantity: 1, price: 0 }])
        setFormData({
          clientId: "",
          type: "INVOICE",
          invoiceNum: "",
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: "",
          address: "",
          vatRate: 20.0,
          status: "DRAFT"
        })
        fetchInvoices()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce document ? Cette action est irréversible.")) return
    const res = await fetch(`/api/admin/invoices?id=${id}`, { method: "DELETE" })
    if (res.ok) fetchInvoices()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === invoices.length) setSelectedIds([])
    else setSelectedIds(invoices.map(i => i.id))
  }

  const downloadSelected = () => {
    if (selectedIds.length === 0) return
    window.open(`/admin/invoices/print?ids=${selectedIds.join(',')}`, '_blank')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-light text-white italic">Factures & Devis</h2>
        <div className="flex gap-4 w-full md:w-auto">
           {selectedIds.length > 0 && (
             <button 
               onClick={downloadSelected}
               className="bg-zinc-800 text-white px-4 py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-zinc-700 transition"
             >
               Télécharger ({selectedIds.length})
             </button>
           )}
           <input 
             type="text" 
             placeholder="Rechercher N°..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded text-sm text-white focus:border-white transition"
           />
           <select 
             value={filterClientId}
             onChange={(e) => setFilterClientId(e.target.value)}
             className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded text-sm text-white focus:border-white transition"
           >
             <option value="">Tous les clients</option>
             {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
           <button 
             onClick={() => setShowForm(!showForm)}
             className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition text-xs uppercase tracking-widest whitespace-nowrap"
           >
             {showForm ? "Fermer" : "Créer"}
           </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                  >
                    <option value="INVOICE">Facture</option>
                    <option value="QUOTE">Devis</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Client *</label>
                  <select 
                    value={formData.clientId} 
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">N° Document</label>
                  <input 
                    type="text" 
                    value={formData.invoiceNum}
                    onChange={(e) => setFormData({...formData, invoiceNum: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                    required
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Échéance</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                    required
                  />
               </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Adresse de facturation client *</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white resize-none"
                  rows={2}
                  required
                />
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Articles / Prestations</h4>
                  <button type="button" onClick={addItem} className="text-xs text-white hover:text-zinc-400 font-bold uppercase tracking-widest">+ Ligne</button>
               </div>
               
               {items.map((item, idx) => (
                 <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-6">
                       <input 
                         placeholder="Description"
                         value={item.description}
                         onChange={(e) => updateItem(idx, "description", e.target.value)}
                         className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                         required
                       />
                    </div>
                    <div className="md:col-span-2">
                       <input 
                         type="number" 
                         placeholder="Qté"
                         value={item.quantity}
                         onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value))}
                         className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                         required
                       />
                    </div>
                    <div className="md:col-span-3">
                       <input 
                         type="number" 
                         placeholder="Prix HT"
                         value={item.price}
                         onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value))}
                         className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                         required
                       />
                    </div>
                    <div className="md:col-span-1 text-right">
                       <button type="button" onClick={() => removeItem(idx)} className="text-red-900 hover:text-red-500 transition font-bold">&times;</button>
                    </div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-800 pt-8">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">TVA (%)</label>
                  <input 
                    type="number" 
                    value={formData.vatRate}
                    onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded text-white"
                  />
               </div>
               <div className="text-right md:col-span-2 flex flex-col justify-end">
                  <div className="space-y-1 text-sm text-zinc-500">
                     <p>Sous-total HT: {subtotal.toLocaleString()} €</p>
                     <p>TVA ({formData.vatRate}%): {vatAmount.toLocaleString()} €</p>
                  </div>
                  <p className="text-4xl font-light text-white mt-2">{totalAmount.toLocaleString()} € <span className="text-xs uppercase tracking-widest text-zinc-500">TTC</span></p>
               </div>
            </div>

            <div className="flex justify-end pt-4">
               <button 
                 type="submit" 
                 disabled={loading}
                 className="bg-white text-black px-16 py-4 rounded-full font-bold hover:bg-zinc-200 transition uppercase tracking-[0.2em] text-sm"
               >
                 {loading ? "Création..." : `Enregistrer ${formData.type === "QUOTE" ? "le devis" : "la facture"}`}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">
              <th className="px-6 py-5 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === invoices.length && invoices.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-0"
                />
              </th>
              <th className="px-6 py-5">Document</th>
              <th className="px-6 py-5">Client</th>
              <th className="px-6 py-5 text-right">Montant TTC</th>
              <th className="px-6 py-5 text-center">Type</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-600 italic">Aucun document trouvé.</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className={`hover:bg-zinc-800/30 transition duration-300 group ${selectedIds.includes(inv.id) ? 'bg-zinc-800/50' : ''}`}>
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(inv.id)}
                      onChange={() => toggleSelect(inv.id)}
                      className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-0"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-zinc-200 font-medium group-hover:text-white transition">{inv.invoiceNum}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{new Date(inv.issueDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-zinc-400">{inv.client?.name}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-white font-medium">{inv.totalAmount.toLocaleString()} €</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded-full border ${inv.type === 'QUOTE' ? 'bg-amber-950/20 text-amber-500 border-amber-900/50' : 'bg-blue-950/20 text-blue-500 border-blue-900/50'}`}>
                      {inv.type === 'QUOTE' ? 'Devis' : 'Facture'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-6">
                    <Link 
                      href={`/admin/invoices/${inv.id}`} 
                      className="text-white hover:underline transition text-[10px] uppercase font-bold tracking-widest"
                    >
                      Voir
                    </Link>
                    <button 
                      onClick={() => deleteInvoice(inv.id)}
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
  )
}
