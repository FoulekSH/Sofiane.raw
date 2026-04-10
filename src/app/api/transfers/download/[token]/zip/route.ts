import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createReadStream } from "fs"
import path from "path"
import archiver from "archiver"
import { Readable } from "stream"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { searchParams } = new URL(req.url)
  const fileIds = searchParams.get("fileIds")?.split(",")

  const transfer = await prisma.transfer.findUnique({
    where: { token },
    include: { files: true }
  })

  if (!transfer) {
    return NextResponse.json({ error: "Transfert introuvable" }, { status: 404 })
  }

  const isExpired = new Date(transfer.expiresAt) < new Date()
  if (isExpired) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 403 })
  }

  // Filtrer les fichiers à inclure
  const filesToInclude = fileIds 
    ? transfer.files.filter(f => fileIds.includes(f.id))
    : transfer.files

  if (filesToInclude.length === 0) {
    return NextResponse.json({ error: "Aucun fichier à télécharger" }, { status: 400 })
  }

  // Créer une archive ZIP en streaming
  const archive = archiver('zip', {
    zlib: { level: 9 } // Compression maximale
  })

  // Convertir l'archive (un flux Node.js) en un format lisible par Next.js (Web Response)
  const stream = new ReadableStream({
    start(controller) {
      archive.on('data', (chunk) => controller.enqueue(chunk))
      archive.on('end', () => controller.close())
      archive.on('error', (err) => controller.error(err))

      for (const file of filesToInclude) {
        const filePath = path.join(process.cwd(), "uploads", "transfers", file.filename)
        archive.file(filePath, { name: file.originalName })
      }
      
      archive.finalize()
    }
  })

  // Mettre à jour le compteur de téléchargements
  await prisma.transfer.update({
    where: { id: transfer.id },
    data: { downloads: { increment: 1 } }
  })

  return new Response(stream, {
    headers: {
      "Content-Disposition": `attachment; filename="SOFIANE-RAW-${token.substring(0, 6)}.zip"`,
      "Content-Type": "application/zip",
    },
  })
}
