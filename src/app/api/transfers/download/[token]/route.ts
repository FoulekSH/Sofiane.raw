import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createReadStream } from "fs"
import { stat } from "fs/promises"
import path from "path"

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  const transfer = await prisma.transfer.findUnique({
    where: { token }
  })

  if (!transfer) {
    return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 })
  }

  const isExpired = new Date(transfer.expiresAt) < new Date()
  if (isExpired) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 403 })
  }

  const filePath = path.join(process.cwd(), "uploads", "transfers", transfer.filename)

  try {
    const fileStats = await stat(filePath)
    const stream = createReadStream(filePath)

    // Update download count
    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { downloads: { increment: 1 } }
    })

    return new Response(stream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${transfer.originalName}"`,
        "Content-Length": fileStats.size.toString(),
        "Content-Type": "application/octet-stream",
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Fichier introuvable sur le serveur" }, { status: 404 })
  }
}
