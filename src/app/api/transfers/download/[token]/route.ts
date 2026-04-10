import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createReadStream } from "fs"
import { stat } from "fs/promises"
import path from "path"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get("fileId")

  const transfer = await prisma.transfer.findUnique({
    where: { token },
    include: { files: true }
  })

  if (!transfer) {
    return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 })
  }

  const isExpired = new Date(transfer.expiresAt) < new Date()
  if (isExpired) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 403 })
  }

  // Find the specific file
  const file = fileId 
    ? transfer.files.find(f => f.id === fileId)
    : transfer.files[0] // Default to first if no ID

  if (!file) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 })
  }

  const filePath = path.join(process.cwd(), "uploads", "transfers", file.filename)

  try {
    const fileStats = await stat(filePath)
    const stream = createReadStream(filePath)

    // Update download count (only once per full transfer or per file? Let's say per file)
    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { downloads: { increment: 1 } }
    })

    return new Response(stream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${file.originalName}"`,
        "Content-Length": fileStats.size.toString(),
        "Content-Type": "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Fichier introuvable sur le serveur" }, { status: 404 })
  }
}
