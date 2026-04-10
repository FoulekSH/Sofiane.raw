import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Chemin absolu vers le dossier public/photos
    const photosDir = path.join(process.cwd(), "public", "photos")
    
    // Vérification et création du dossier avec les droits nécessaires
    try {
      await fs.access(photosDir)
    } catch {
      await fs.mkdir(photosDir, { recursive: true, mode: 0o777 })
    }

    const addedPhotos = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Nettoyage et génération du nom de fichier
      const originalName = file.name
      const extension = path.extname(originalName)
      const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, "_")
      const finalName = `${Date.now()}_${baseName}${extension}`
      
      const filePath = path.join(photosDir, finalName)

      // Écriture physique du fichier sur le disque
      await fs.writeFile(filePath, buffer)
      
      // On s'assure que le fichier est lisible par tous
      await fs.chmod(filePath, 0o644)

      // Enregistrement en base de données
      const photo = await prisma.photo.upsert({
        where: { id: finalName },
        update: { filename: finalName },
        create: {
          id: finalName,
          filename: finalName,
          title: originalName,
          category: "Portfolio",
          isPublic: true,
          order: 0
        }
      })
      addedPhotos.push(photo)
    }

    return NextResponse.json({ success: true, count: addedPhotos.length, photos: addedPhotos })
  } catch (error: any) {
    console.error("CRITICAL UPLOAD ERROR:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload: " + error.message }, { status: 500 })
  }
}
