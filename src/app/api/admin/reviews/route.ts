import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const reviews = await prisma.review.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { authorName, rating, text, source } = await req.json()
    if (!authorName || !authorName.trim() || !text || !text.trim()) {
      return NextResponse.json({ error: "Le nom et le texte de l'avis sont requis" }, { status: 400 })
    }

    const count = await prisma.review.count()
    const review = await prisma.review.create({
      data: {
        authorName: authorName.trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        text: text.trim(),
        source,
        order: count
      }
    })

    revalidatePath("/")
    return NextResponse.json(review)
  } catch (error) {
    console.error("Erreur création avis:", error)
    const message = error instanceof Error ? error.message : "Erreur lors de la création"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { id, authorName, rating, text, source, order, isPublic } = await req.json()
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    const review = await prisma.review.update({
      where: { id },
      data: {
        authorName,
        rating: rating !== undefined ? Math.min(5, Math.max(1, Number(rating))) : undefined,
        text,
        source,
        order,
        isPublic
      }
    })

    revalidatePath("/")
    return NextResponse.json(review)
  } catch (error) {
    console.error("Erreur mise à jour avis:", error)
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
    await prisma.review.delete({ where: { id } })
    revalidatePath("/")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression avis:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
