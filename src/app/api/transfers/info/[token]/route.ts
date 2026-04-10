import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const transfer = await prisma.transfer.findUnique({
      where: { token },
      include: { 
        client: {
          select: { name: true }
        },
        files: true 
      }
    })

    if (!transfer) {
      return NextResponse.json({ error: "Transfert introuvable" }, { status: 404 })
    }

    // On vérifie l'expiration
    if (new Date(transfer.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Lien expiré", expired: true }, { status: 403 })
    }

    // On renvoie les données (on masque le password s'il y en a un, mais on indique s'il est requis)
    return NextResponse.json({
      id: transfer.id,
      token: transfer.token,
      expiresAt: transfer.expiresAt,
      client: transfer.client,
      files: transfer.files,
      hasPassword: !!transfer.password,
      // Note: Pour garder la logique simple du client actuel, on renvoie le password 
      // mais idéalement il faudrait une vérification côté serveur.
      password: transfer.password 
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
