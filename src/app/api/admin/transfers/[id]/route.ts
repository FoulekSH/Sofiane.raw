import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { unlink } from "fs/promises"
import path from "path"

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

  try {
    const transfer = await prisma.transfer.findUnique({ where: { id } })
    if (transfer) {
      const filePath = path.join(process.cwd(), "uploads", "transfers", transfer.filename)
      try {
        await unlink(filePath)
      } catch (err) {
        console.error("File deletion error (already gone?):", err)
      }
      await prisma.transfer.delete({ where: { id } })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
