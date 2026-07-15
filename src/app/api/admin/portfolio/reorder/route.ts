import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { orders } = await req.json() // Array of { id: string, order: number }
    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    // On utilise une transaction pour tout mettre à jour d'un coup
    await prisma.$transaction(
      orders.map((o: { id: string, order: number }) =>
        prisma.photo.update({
          where: { id: o.id },
          data: { order: o.order }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reorder error:", error)
    return NextResponse.json({ error: "Erreur lors de la réorganisation" }, { status: 500 })
  }
}
