import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const collaborations = await prisma.collaboration.findMany({
    orderBy: { order: "asc" }
  })
  return NextResponse.json(collaborations)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { name, image, description, link } = await req.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
    }

    const count = await prisma.collaboration.count()
    const collaboration = await prisma.collaboration.create({
      data: { name: name.trim(), image, description, link, order: count }
    })

    revalidatePath("/")
    return NextResponse.json(collaboration)
  } catch (error) {
    console.error("Erreur création collaboration:", error)
    const message = error instanceof Error ? error.message : "Erreur lors de la création"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { id, name, image, description, link, order, isPublic } = await req.json()
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    const collaboration = await prisma.collaboration.update({
      where: { id },
      data: { name, image, description, link, order, isPublic }
    })

    revalidatePath("/")
    return NextResponse.json(collaboration)
  } catch (error) {
    console.error("Erreur mise à jour collaboration:", error)
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

  try {
    await prisma.collaboration.delete({ where: { id } })
    revalidatePath("/")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression collaboration:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
