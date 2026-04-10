"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-24">
      {/* LUXURY TRUSTPILOT BADGE */}
      <div className="pb-12 border-b border-zinc-900/50 flex flex-col items-center gap-10">
        <a 
          href="https://fr.trustpilot.com/review/sofiane.raw.evasion-studio.fr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-6 p-10 rounded-3xl border border-zinc-900 bg-zinc-950/50 hover:border-emerald-500/30 transition-all duration-700"
        >
          {/* Subtle Glow Background */}
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="relative flex items-center gap-3">
             <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 9.124l-9.167-.144L12 0 9.167 8.98 0 9.124l7.417 5.378L4.583 24 12 18.622 19.417 24l-2.834-9.498L24 9.124z"/>
             </svg>
             <span className="text-xl font-black tracking-tighter text-white uppercase italic">Trustpilot</span>
          </div>

          <div className="relative flex gap-1.5">
            {[1,2,3,4,5].map(i => (
               <div key={i} className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded group-hover:bg-emerald-500 transition-all duration-500 delay-[50ms]">
                  <svg className="w-4 h-4 text-emerald-500 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
               </div>
            ))}
          </div>

          <div className="relative text-center space-y-2">
             <p className="text-zinc-500 text-[9px] uppercase tracking-[0.6em] font-bold group-hover:text-white transition-colors">Retrouvez-nous sur Trustpilot</p>
             <div className="flex items-center justify-center gap-4 text-[8px] uppercase tracking-widest text-zinc-700">
                <span className="w-8 h-px bg-zinc-900"></span>
                <span className="group-hover:text-emerald-500 transition-colors">Partagez votre expérience</span>
                <span className="w-8 h-px bg-zinc-900"></span>
             </div>
          </div>
        </a>
      </div>

      {status === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-20 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
          <h3 className="text-2xl font-bold uppercase tracking-widest text-white">Message Envoyé</h3>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Sofiane vous répondra dans les plus brefs délais.</p>
          <button 
            onClick={() => setStatus('idle')}
            className="text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-400 hover:text-white transition mt-8"
          >
            Envoyer un autre message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4 text-left border-b border-zinc-900 pb-4 focus-within:border-white transition-colors">
              <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Votre Nom</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-transparent border-none outline-none text-white text-xl font-light placeholder:text-zinc-800"
                placeholder="JEAN DUPONT"
              />
            </div>
            <div className="space-y-4 text-left border-b border-zinc-900 pb-4 focus-within:border-white transition-colors">
              <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Votre Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full bg-transparent border-none outline-none text-white text-xl font-light placeholder:text-zinc-800"
                placeholder="CONTACT@EXEMPLE.COM"
              />
            </div>
          </div>

          <div className="space-y-4 text-left border-b border-zinc-900 pb-4 focus-within:border-white transition-colors">
            <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Objet</label>
            <input 
              type="text" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full bg-transparent border-none outline-none text-white text-xl font-light placeholder:text-zinc-800"
              placeholder="PROJET ÉDITORIAL / SHOOTING PRIVÉ"
            />
          </div>

          <div className="space-y-4 text-left border-b border-zinc-900 pb-4 focus-within:border-white transition-colors">
            <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Votre Message</label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              rows={4}
              className="w-full bg-transparent border-none outline-none text-white text-xl font-light placeholder:text-zinc-800 resize-none"
              placeholder="DÉTAILLEZ VOTRE VISION ICI..."
            />
          </div>

          <div className="flex flex-col items-center gap-8">
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="group relative px-20 py-6 overflow-hidden bg-white rounded-full transition-all duration-500 hover:bg-zinc-200 disabled:opacity-50"
            >
              <span className="relative z-10 text-black text-xs font-black uppercase tracking-[0.4em]">
                {status === 'loading' ? 'ENVOI EN COURS...' : 'ENVOYER LE MESSAGE'}
              </span>
            </button>
            {status === 'error' && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Une erreur est survenue. Veuillez réessayer.</p>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
