"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function ContactForm() {
  const [status, setStatus] = useState("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("MESSAGE TRANSMIS AVEC SUCCÈS.")
    setTimeout(() => setStatus(""), 5000)
  }

  return (
    <div className="max-w-4xl mx-auto bg-transparent p-4 md:p-12 text-left">
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-4">VOTRE NOM</label>
            <input 
              type="text" 
              placeholder="Jean Dupont"
              className="w-full bg-transparent border-b border-zinc-800 py-4 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-4">VOTRE EMAIL</label>
            <input 
              type="email" 
              placeholder="jean@exemple.com"
              className="w-full bg-transparent border-b border-zinc-800 py-4 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-4">VOTRE PROJET</label>
          <select className="w-full bg-transparent border-b border-zinc-800 py-4 text-zinc-400 focus:outline-none focus:border-white transition-all duration-500 appearance-none">
            <option className="bg-zinc-950">Portrait de Mode / Editorial</option>
            <option className="bg-zinc-950">Événementiel de Prestige</option>
            <option className="bg-zinc-950">Campagne Commerciale</option>
            <option className="bg-zinc-950">Mariage High-End</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-4">MESSAGE</label>
          <textarea 
            rows={4}
            placeholder="Dites-moi tout sur votre vision..."
            className="w-full bg-transparent border-b border-zinc-800 py-4 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800 resize-none"
            required
          ></textarea>
        </div>
        
        <div className="flex flex-col items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="group relative px-20 py-6 overflow-hidden border border-zinc-800 rounded-full transition-all duration-500 hover:border-white"
          >
            <span className="relative z-10 text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-400 group-hover:text-black transition-colors duration-500">
              Envoyer la requête
            </span>
            <motion.div 
              className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"
            />
          </motion.button>
          
          {status && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-500 text-[10px] uppercase tracking-widest font-bold"
            >
              {status}
            </motion.p>
          )}
        </div>
      </form>
    </div>
  )
}
