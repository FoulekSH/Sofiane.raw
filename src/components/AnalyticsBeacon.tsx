"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function AnalyticsBeacon() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login")) return

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer || null })

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }))
      } else {
        fetch("/api/analytics/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true })
      }
    } catch {
      // Silencieux : un échec d'analytics ne doit jamais gêner le visiteur.
    }
  }, [pathname])

  return null
}
