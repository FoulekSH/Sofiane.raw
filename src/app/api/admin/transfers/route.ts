import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const clientId = formData.get("clientId") as string
    const expirationDays = parseInt(formData.get("expirationDays") as string || "7")

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const token = crypto.randomBytes(16).toString("hex")
    const filename = `${token}-${file.name}`
    const uploadDir = path.join(process.cwd(), "uploads", "transfers")
    
    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true })
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    const transfer = await prisma.transfer.create({
      data: {
        token,
        filename,
        originalName: file.name,
        size: file.size,
        expiresAt,
        clientId: clientId || null,
      }
    })

    return NextResponse.json({ 
      success: true, 
      token, 
      url: `${process.env.NEXTAUTH_URL}/dl/${token}`,
      transfer 
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload: " + error.message }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const transfers = await prisma.transfer.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true }
  })

  return NextResponse.json(transfers)
}
