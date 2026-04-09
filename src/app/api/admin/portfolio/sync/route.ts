import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const photosDir = path.join(process.cwd(), 'public', 'photos')
  let photos: string[] = []
  
  try {
    const files = await fs.readdir(photosDir)
    photos = files.filter(file => /\.(jpg|jpeg|png|webp|JPG)$/i.test(file))
  } catch (error) {
    return NextResponse.json({ error: "Dossier photos introuvable" }, { status: 500 })
  }

  const existingPhotos = await prisma.photo.findMany({
    select: { filename: true }
  })
  const existingFilenames = new Set(existingPhotos.map(p => p.filename))

  const newPhotos = photos.filter(f => !existingFilenames.has(f))

  for (let i = 0; i < newPhotos.length; i++) {
    const filename = newPhotos[i]
    await prisma.photo.create({
      data: {
        filename,
        order: existingPhotos.length + i,
        isPublic: true,
        category: "Portfolio"
      },
    })
  }

  return NextResponse.json({ success: true, added: newPhotos.length })
}
