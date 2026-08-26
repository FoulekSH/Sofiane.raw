import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import sharp from "sharp"

const CACHE_DIR = path.join(process.cwd(), ".cache", "photos")

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  } catch {}
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const filePath = path.join(process.cwd(), "public", "photos", filename)
  const cachePath = path.join(CACHE_DIR, `wm_${filename}.jpg`)

  try {
    // Check if source file exists
    const sourceStat = await fs.stat(filePath)

    // Try to serve from cache
    try {
      const cacheStat = await fs.stat(cachePath)
      // Cache is valid if it's newer than the source file
      if (cacheStat.mtimeMs > sourceStat.mtimeMs) {
        const cachedBuffer = await fs.readFile(cachePath)
        return new NextResponse(cachedBuffer as any, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
            "ETag": `"${cacheStat.mtimeMs}"`,
          },
        })
      }
    } catch {
      // Cache miss, continue to generate
    }

    // Generate watermarked image
    const fileBuffer = await fs.readFile(filePath)

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

    const watermarkedBuffer = await sharp(fileBuffer)
      .composite([
        { 
          input: svgBuffer, 
          gravity: 'center', 
          blend: 'over' 
        }
      ])
      .jpeg({ quality: 80 })
      .toBuffer()

    // Save to disk cache
    await ensureCacheDir()
    await fs.writeFile(cachePath, watermarkedBuffer)

    return new NextResponse(watermarkedBuffer as any, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Watermarking error:", error)
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 })
  }
}

