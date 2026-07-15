import prisma from './src/lib/prisma'

async function main() {
  try {
    const photos = await prisma.photo.findMany()
    const filenames = photos.map(p => p.filename)
    const duplicates = filenames.filter((item, index) => filenames.indexOf(item) !== index)
    console.log(`Total photos: ${photos.length}`)
    console.log(`Duplicate filenames: ${duplicates.length}`)
    if (duplicates.length > 0) {
      console.log('Sample duplicates:', duplicates.slice(0, 5))
    }
  } catch (error) {
    console.error('Error querying DB:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
