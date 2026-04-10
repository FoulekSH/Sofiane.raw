import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { ids, data } = await req.json()
    if (!ids || !ids.length) return NextResponse.json({ error: "IDs manquants" }, { status: 400 })

    const updated = await prisma.photo.updateMany({
      where: { id: { in: ids } },
      data
    })
    return NextResponse.json({ success: true, count: updated.count })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour groupée" }, { status: 500 })
  }
}
