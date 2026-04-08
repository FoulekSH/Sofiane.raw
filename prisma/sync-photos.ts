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

  for (let i = 0; i < photos.length; i++) {
    const filename = photos[i]
    await prisma.photo.upsert({
      where: { id: `seed-${filename}` }, // Dummy ID for seeding or use filename as key if unique enough
      update: {},
      create: {
        id: `seed-${filename}`,
        filename,
        order: i,
        isPublic: true,
        isFeatured: i === 0, // Make the first one featured
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
