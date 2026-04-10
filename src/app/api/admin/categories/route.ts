import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  const configs = await prisma.categoryConfig.findMany()
  return NextResponse.json(configs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { name, slug, coverImage, description } = await req.json()
    
    const config = await prisma.categoryConfig.upsert({
      where: { slug },
      update: { name, coverImage, description },
      create: { name, slug, coverImage, description }
    })

    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: "Erreur config catégorie" }, { status: 500 })
  }
}
