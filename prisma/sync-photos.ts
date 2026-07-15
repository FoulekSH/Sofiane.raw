import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const photosDir = path.join(process.cwd(), 'public', 'photos')
  let photos: string[] = []
  
  try {
    const files = await fs.readdir(photosDir)
    photos = files.filter(file => /\.(jpg|jpeg|png|webp|JPG)$/i.test(file))
  } catch (error) {
    console.error("Error reading photos directory:", error)
    return
  }

  console.log(`Found ${photos.length} photos in public/photos. Syncing with database...`)

  const existingPhotos = await prisma.photo.findMany({
    select: { filename: true, order: true }
  })
  const existingFilenames = new Set(existingPhotos.map(p => p.filename))
  const maxOrder = Math.max(0, ...existingPhotos.map(p => p.order))

  for (let i = 0; i < photos.length; i++) {
    const filename = photos[i]
    if (existingFilenames.has(filename)) continue;

    await prisma.photo.upsert({
      where: { id: filename }, // Use filename as ID directly
      update: {
        isPublic: true // Ensure they are public when synced
      },
      create: {
        id: filename,
        filename,
        order: maxOrder + 1 + i,
        isPublic: true,
        isFeatured: false,
      },
    })
  }

  console.log("Database synced with public photos.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
