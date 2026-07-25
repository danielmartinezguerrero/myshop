import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Prisma 7 requires a driver adapter to connect to the database
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

// A single PrismaClient instance shared across the app
const prisma = new PrismaClient({ adapter })

export default prisma