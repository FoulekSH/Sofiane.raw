import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Analytics maison, minimaliste et auto-hébergé : pas de cookie, pas d'IP
// stockée, pas de service tiers. Juste un compteur de pages vues par chemin.
export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path manquant" }, { status: 400 })
    }

    const ua = req.headers.get("user-agent") || ""
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop"

    await prisma.pageView.create({
      data: {
        path: path.slice(0, 300),
        referrer: typeof referrer === "string" ? referrer.slice(0, 300) || null : null,
        device
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    // On ne fait jamais échouer la navigation du visiteur pour un souci d'analytics.
    console.error("Erreur analytics:", error)
    return NextResponse.json({ ok: false })
  }
}
