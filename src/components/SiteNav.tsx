"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, CalendarCheck } from "lucide-react"

const LINKS = [
  { label: "Portfolio", hash: "gallery" },
  { label: "Prestations", hash: "prestations" },
  { label: "Tarifs", href: "/tarifs" },
]

export default function SiteNav() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Recale le scroll vers l'ancre de l'URL (ex: venant de /tarifs vers /#contact) :
  // au premier saut, une bonne partie des images plus bas dans la page n'ont pas
  // encore fini de se charger, ce qui décale silencieusement la section visée.
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const scrollToHash = () => {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" })
    }
    const timers = [50, 350, 800].map((delay) => window.setTimeout(scrollToHash, delay))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [pathname])

  const hidden = pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/dl")
  if (hidden) return null

  const isHome = pathname === "/"
  const linkHref = (link: (typeof LINKS)[number]) =>
    link.href ? link.href : isHome ? `#${link.hash}` : `/#${link.hash}`
  const reserveHref = isHome ? "#contact" : "/#contact"

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: visible ? 0 : -88, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-[80] bg-zinc-950/75 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.02),0_12px_30px_-15px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-[2px] text-sm tracking-[0.3em] font-light text-white">
            <span className="group-hover:text-amber-200 transition-colors duration-500">S</span>
            <span className="font-bold bg-gradient-to-r from-amber-200 to-yellow-600 bg-clip-text text-transparent">.RAW</span>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={linkHref(link)}
                className="group relative py-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-white transition-colors duration-300"
              >
                {link.label}
                <span className="pointer-events-none absolute left-1/2 -bottom-0.5 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-amber-200 to-yellow-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            <a
              href={reserveHref}
              className="group relative flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-600 text-black overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <CalendarCheck size={13} strokeWidth={2.5} className="relative" />
              <span className="relative text-[10px] font-black uppercase tracking-[0.2em]">Réserver</span>
            </a>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-white p-2 -mr-2"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-zinc-950/98 backdrop-blur-sm flex flex-col items-center justify-center gap-10 md:hidden"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-4 text-white p-2"
              aria-label="Fermer le menu"
            >
              <X size={22} />
            </button>
            {LINKS.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
              >
                <Link
                  href={linkHref(link)}
                  onClick={() => setOpen(false)}
                  className="text-2xl uppercase tracking-[0.2em] font-light italic text-white hover:text-amber-200 transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.a
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * LINKS.length, duration: 0.35 }}
              href={reserveHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 mt-4 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-600 text-black"
            >
              <CalendarCheck size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Réserver une séance</span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
