import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const plans = await prisma.pricingPlan.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { name, price, tagline, features, highlighted } = await req.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
    }

    const count = await prisma.pricingPlan.count()
    const plan = await prisma.pricingPlan.create({
      data: {
        name: name.trim(),
        price: price || "Sur devis",
        tagline,
        features: JSON.stringify(features || []),
        highlighted: !!highlighted,
        order: count
      }
    })

    revalidatePath("/tarifs")
    return NextResponse.json(plan)
  } catch (error) {
    console.error("Erreur création tarif:", error)
    const message = error instanceof Error ? error.message : "Erreur lors de la création"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { id, name, price, tagline, features, highlighted, order, isPublic } = await req.json()
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    const plan = await prisma.pricingPlan.update({
      where: { id },
      data: {
        name,
        price,
        tagline,
        features: features !== undefined ? JSON.stringify(features) : undefined,
        highlighted,
        order,
        isPublic
      }
    })

    revalidatePath("/tarifs")
    return NextResponse.json(plan)
  } catch (error) {
    console.error("Erreur mise à jour tarif:", error)
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
    await prisma.pricingPlan.delete({ where: { id } })
    revalidatePath("/tarifs")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression tarif:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
