"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    const res = await fetch("/api/admin/messages")
    if (res.ok) setMessages(await res.json())
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    })
    if (res.ok) fetchMessages()
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return
    const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchMessages()
      setSelectedMessage(null)
    }
  }

  if (loading) return <div className="text-white uppercase tracking-widest text-xs">Chargement des messages...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
      {/* Liste des messages */}
      <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold uppercase tracking-widest">Inbox</h2>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="p-10 text-center text-zinc-600 text-xs uppercase tracking-widest">Aucun message</div>
          ) : (
            messages.map((m) => (
              <button 
                key={m.id}
                onClick={() => {
                  setSelectedMessage(m)
                  if (m.status === 'UNREAD') updateStatus(m.id, 'READ')
                }}
                className={`w-full p-6 text-left border-b border-zinc-800/50 transition-all hover:bg-zinc-800/50 ${selectedMessage?.id === m.id ? 'bg-zinc-800' : ''} ${m.status === 'UNREAD' ? 'border-l-4 border-l-white' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{m.name}</span>
                  <span className="text-[8px] text-zinc-600">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{m.subject}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-1">{m.message}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Détail du message */}
      <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {selectedMessage ? (
            <motion.div 
              key={selectedMessage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-10 space-y-10 h-full flex flex-col"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold uppercase tracking-tighter">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-white">{selectedMessage.name}</span>
                    <span className="text-zinc-600">&lt;{selectedMessage.email}&gt;</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="text-red-900 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest"
                >
                  Supprimer
                </button>
              </div>

              <div className="flex-grow bg-zinc-950/50 p-8 rounded-2xl border border-zinc-800/50 text-zinc-300 text-sm leading-relaxed whitespace-pre-line overflow-y-auto">
                {selectedMessage.message}
              </div>

              <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Reçu le {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition"
                >
                  Répondre par email
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-700 text-xs uppercase tracking-[0.4em]">
              Sélectionnez un message pour le lire
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
