import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import sharp from "sharp"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const filePath = path.join(process.cwd(), "public", "photos", filename)

  try {
    const fileBuffer = await fs.readFile(filePath)
    
    // Create Watermark SVG
    const svgWatermark = `
      <svg width="500" height="200">
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial" 
          font-size="40" 
          font-weight="bold"
          fill="white" 
          fill-opacity="0.2" 
          text-anchor="middle"
        >
          SOFIANE .RAW
        </text>
      </svg>
    `
    const svgBuffer = Buffer.from(svgWatermark)

    // Process image with sharp
    const image = sharp(fileBuffer)
    const metadata = await image.metadata()

    // Add watermark
    const watermarkedBuffer = await image
      .composite([
        { 
          input: svgBuffer, 
          gravity: 'center', 
          blend: 'over' 
        }
      ])
      .jpeg({ quality: 80 }) // Optimize for web
      .toBuffer()

    const ext = path.extname(filename).toLowerCase()
    let contentType = "image/jpeg"
    if (ext === ".png") contentType = "image/png"
    if (ext === ".webp") contentType = "image/webp"

    return new NextResponse(watermarkedBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Shorter cache for watermarked images
      },
    })
  } catch (error) {
    console.error("Watermarking error:", error)
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 })
  }
}

