"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarCheck } from "lucide-react"

export default function FloatingCTA() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Pas de bouton "réserver" dans l'admin, la connexion ou sur le formulaire lui-même.
  const hidden = pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/dl")
  if (hidden) return null

  const href = pathname === "/" ? "#contact" : "/#contact"

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={href}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 bg-white text-black pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-black/40 hover:bg-zinc-200 hover:scale-105 transition-all duration-300"
        >
          <CalendarCheck size={16} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Réserver</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
