import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (id) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { 
        invoices: { orderBy: { createdAt: "desc" } },
        transfers: { orderBy: { createdAt: "desc" } }
      }
    })
    return NextResponse.json(client)
  }

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" }
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { name, email, phone, company, address, notes } = await req.json()
    if (!name) return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400 })

    const client = await prisma.client.create({
      data: { name, email, phone, company, address, notes }
    })
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { id, name, email, phone, company, address, notes } = await req.json()
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    const client = await prisma.client.update({
      where: { id },
      data: { name, email, phone, company, address, notes }
    })
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

  try {
    // Check for dependencies first (optional, Prisma handles if not cascade)
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Impossible de supprimer le client (il a peut-être des factures)" }, { status: 500 })
  }
}
