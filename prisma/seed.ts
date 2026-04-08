import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Bilal201', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sofiane.raw' },
    update: {},
    create: {
      email: 'admin@sofiane.raw',
      name: 'Sofiane',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log({ admin })
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
