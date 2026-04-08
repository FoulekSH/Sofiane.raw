import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Reset all featured photos
  await prisma.photo.updateMany({
    data: { isFeatured: false }
  })

  // Upsert belle_image.jpg and set as featured at order 0
  const photo = await prisma.photo.upsert({
    where: { id: 'belle_image.jpg' },
    update: { 
      isFeatured: true,
      order: -1, // Make sure it's at the very top
      isPublic: true,
    },
    create: {
      id: 'belle_image.jpg',
      filename: 'belle_image.jpg',
      order: -1,
      isPublic: true,
      isFeatured: true,
      category: 'Portfolio',
    },
  })

  console.log(`Successfully set ${photo.filename} as the featured photo and prioritized its order.`)
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
