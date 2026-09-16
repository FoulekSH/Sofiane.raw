"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const LINKS = [
  { label: "Portfolio", hash: "gallery" },
  { label: "Prestations", hash: "prestations" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Contact", hash: "contact" },
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

  const hidden = pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/dl")
  if (hidden) return null

  const isHome = pathname === "/"
  const linkHref = (link: (typeof LINKS)[number]) =>
    link.href ? link.href : isHome ? `#${link.hash}` : `/#${link.hash}`

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-[80] bg-zinc-950/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm tracking-[0.3em] font-light text-white hover:text-zinc-300 transition">
            S <span className="font-bold">.RAW</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={linkHref(link)}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={linkHref(link)}
                onClick={() => setOpen(false)}
                className="text-2xl uppercase tracking-[0.2em] font-light italic text-white hover:text-zinc-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
