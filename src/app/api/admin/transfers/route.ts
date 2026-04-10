import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import crypto from "crypto"

const MAX_TOTAL_SIZE = 10 * 1024 * 1024 * 1024 // 10GB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll("file") as File[]
    const clientId = formData.get("clientId") as string
    const expirationDays = parseInt(formData.get("expirationDays") as string || "7")
    const password = formData.get("password") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Check total size limit
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json({ error: "Limite de 10 Go dépassée" }, { status: 400 })
    }

    const token = crypto.randomBytes(16).toString("hex")
    const uploadDir = path.join(process.cwd(), "uploads", "transfers")
    
    await mkdir(uploadDir, { recursive: true })
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    const transfer = await prisma.transfer.create({
      data: {
        token,
        expiresAt,
        password: password || null,
        clientId: clientId || null,
      }
    })

    const transferFiles = []
    for (const file of files) {
      const filename = `${token}-${crypto.randomBytes(4).toString("hex")}-${file.name}`
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)

      const tf = await prisma.transferFile.create({
        data: {
          transferId: transfer.id,
          filename,
          originalName: file.name,
          size: file.size,
        }
      })
      transferFiles.push(tf)
    }

    return NextResponse.json({ 
      success: true, 
      token, 
      url: `${process.env.NEXTAUTH_URL}/dl/${token}`,
      transfer,
      files: transferFiles
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload: " + error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { id, expiresAt, password } = await req.json()
    
    const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: { 
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        password: password !== undefined ? password : undefined
      }
    })

    return NextResponse.json(updatedTransfer)
  } catch (error) {
    return NextResponse.json({ error: "Erreur mise à jour transfert" }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const transfers = await prisma.transfer.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      client: true,
      files: true
    }
  })

  return NextResponse.json(transfers)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

  try {
    const transfer = await prisma.transfer.findUnique({ 
      where: { id },
      include: { files: true }
    })
    
    if (transfer) {
      for (const file of transfer.files) {
        const filePath = path.join(process.cwd(), "uploads", "transfers", file.filename)
        try { await unlink(filePath) } catch (e) {}
      }
    }
    
    await prisma.transfer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
