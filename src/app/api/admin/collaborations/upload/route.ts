import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import fs from "fs/promises"
import path from "path"

// Réutilise le même dossier / la même route de service que les photos du
// portfolio (public/photos + /api/photos/[filename]) sans créer de ligne
// dans la table Photo : ce n'est pas une photo de galerie.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const photosDir = path.join(process.cwd(), "public", "photos")
    try {
      await fs.access(photosDir)
    } catch {
      await fs.mkdir(photosDir, { recursive: true, mode: 0o777 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = path.extname(file.name)
    const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9]/g, "_")
    const finalName = `collab_${Date.now()}_${baseName}${extension}`

    await fs.writeFile(path.join(photosDir, finalName), buffer)
    await fs.chmod(path.join(photosDir, finalName), 0o644)

    return NextResponse.json({ filename: finalName })
  } catch (error) {
    console.error("Erreur upload collaboration:", error)
    const message = error instanceof Error ? error.message : "Erreur lors de l'upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
