import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const photosDir = path.join(process.cwd(), "public", "photos")
  
  try {
    const filesOnDisk = await fs.readdir(photosDir)
    
    const photosInDb = await prisma.photo.findMany({
      select: { filename: true }
    })
    
    const dbFilenames = new Set(photosInDb.map(p => p.filename))
    
    let deletedCount = 0
    
    for (const file of filesOnDisk) {
      if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file)) {
        if (!dbFilenames.has(file)) {
          // File is orphaned, delete it
          await fs.unlink(path.join(photosDir, file))
          deletedCount++
        }
      }
    }

    return NextResponse.json({ success: true, deleted: deletedCount })
  } catch (error: any) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Erreur lors du nettoyage: " + error.message }, { status: 500 })
  }
}
