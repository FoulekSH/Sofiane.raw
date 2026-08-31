import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const filePath = path.join(process.cwd(), "public", "photos", filename)

  try {
    const fileBuffer = await fs.readFile(filePath)
    
    const ext = path.extname(filename).toLowerCase()
    let contentType = "image/jpeg"
    if (ext === ".png") contentType = "image/png"
    if (ext === ".webp") contentType = "image/webp"

    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Photo API error:", error)
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 })
  }
}


