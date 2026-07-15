"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    companyName: "SINAÏ",
    serviceTagline: "SERVICE DE COMMUNICATION",
    website: "sinai.fr",
    email: "sofiane.belhou@gmail.com",
    phone: "06 65 97 72 08",
    address: "56, Rue Philippe Dartis, 95210 Saint-Gratien",
    siret: "97867179000019",
    bankHolder: "SOFIANE BELHOU",
    iban: "FR43 2004 1010 1252 2303 1Y03 354",
    bic: "PSSTFRPPSCE",
    defaultPaymentTerms: "Virement Bancaire (RIB joint)\nIBAN: FR43 2004 1010 1252 2303 1Y03 354\nBIC: PSSTFRPPSCE",
    defaultFooterNotes: "Pénalités de retard applicables après l'échéance.\nPas d'escompte pour paiement anticipé.\nLa propriété des clichés est transférée après paiement complet."
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings?key=invoice_defaults")
    if (res.ok) {
      const data = await res.json()
      if (data) setSettings(prev => ({ ...prev, ...data }))
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "invoice_defaults", value: settings })
    })
    if (res.ok) alert("Paramètres sauvegardés !")
    setSaving(false)
  }

  if (loading) return <div className="text-white">Chargement...</div>

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-light mb-10 flex items-center gap-4">
        Paramètres de facturation
        {saving && <span className="text-xs bg-white text-black px-2 py-0.5 rounded animate-pulse">Sauvegarde...</span>}
      </h2>

      <form onSubmit={handleSave} className="space-y-12">
        <section className="space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-800 pb-2">Informations Entreprise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Nom de l'entreprise</label>
              <input 
                type="text" 
                value={settings.companyName}
                onChange={e => setSettings({...settings, companyName: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Slogan / Service</label>
              <input 
                type="text" 
                value={settings.serviceTagline}
                onChange={e => setSettings({...settings, serviceTagline: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Adresse</label>
              <input 
                type="text" 
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">SIRET</label>
              <input 
                type="text" 
                value={settings.siret}
                onChange={e => setSettings({...settings, siret: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-800 pb-2">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Email</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={e => setSettings({...settings, email: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Téléphone</label>
              <input 
                type="text" 
                value={settings.phone}
                onChange={e => setSettings({...settings, phone: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Site Web</label>
              <input 
                type="text" 
                value={settings.website}
                onChange={e => setSettings({...settings, website: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-800 pb-2">Informations Bancaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Titulaire du compte</label>
              <input 
                type="text" 
                value={settings.bankHolder}
                onChange={e => setSettings({...settings, bankHolder: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">IBAN</label>
              <input 
                type="text" 
                value={settings.iban}
                onChange={e => setSettings({...settings, iban: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">BIC</label>
              <input 
                type="text" 
                value={settings.bic}
                onChange={e => setSettings({...settings, bic: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-800 pb-2">Textes par défaut</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Conditions de paiement</label>
              <textarea 
                rows={3}
                value={settings.defaultPaymentTerms}
                onChange={e => setSettings({...settings, defaultPaymentTerms: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Notes de bas de page</label>
              <textarea 
                rows={3}
                value={settings.defaultFooterNotes}
                onChange={e => setSettings({...settings, defaultFooterNotes: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded px-4 py-3 text-sm focus:border-white transition outline-none resize-none"
              />
            </div>
          </div>
        </section>

        <button 
          type="submit"
          disabled={saving}
          className="w-full bg-white text-black py-4 rounded text-sm font-black uppercase tracking-widest hover:bg-zinc-200 transition disabled:opacity-50"
        >
          {saving ? "Sauvegarde en cours..." : "Enregistrer les paramètres"}
        </button>
      </form>
    </div>
  )
}
