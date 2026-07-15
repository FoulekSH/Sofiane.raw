import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")
  
  if (key) {
    const setting = await prisma.settings.findUnique({ where: { key } })
    return NextResponse.json(setting ? JSON.parse(setting.value) : null)
  }
  
  const settings = await prisma.settings.findMany()
  const result: Record<string, any> = {}
  settings.forEach(s => {
    try {
      result[s.key] = JSON.parse(s.value)
    } catch (e) {
      result[s.key] = s.value
    }
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { key, value } = await req.json()
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) }
    })
    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 })
  }
}
