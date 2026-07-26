import prisma from '../src/lib/prisma'

// Seeding = filling the database with initial data.
// Useful for development and for anyone cloning the repo.
const main = async () => {
  console.log('Seeding database...')

  // Clean existing data first so the script can be run multiple times
  // Order matters: delete children before parents (foreign key constraints)
  await prisma.product.deleteMany()
  await prisma.subcategory.deleteMany()
  await prisma.category.deleteMany()

  // Create a category with its subcategories and products in one nested call.
  // Prisma lets you create related records together — no need for separate inserts.
  const streaming = await prisma.category.create({
    data: {
      name: 'Streaming',
      slug: 'streaming',
      subcategories: {
        create: [
          {
            name: 'Netflix',
            slug: 'netflix',
            products: {
              create: [
                {
                  name: 'Netflix Premium 4K',
                  slug: 'netflix-premium-4k',
                  description: 'Ultra HD streaming on up to 4 devices at once. Includes downloads and no ads.',
                  price: 4.99,
                  imageUrl: 'https://placehold.co/400x300/e50914/ffffff?text=Netflix+Premium',
                  slots: 4,
                  slotsAvailable: 2,
                },
                {
                  name: 'Netflix Standard',
                  slug: 'netflix-standard',
                  description: 'Full HD streaming on up to 2 devices at once.',
                  price: 3.49,
                  imageUrl: 'https://placehold.co/400x300/e50914/ffffff?text=Netflix+Standard',
                  slots: 2,
                  slotsAvailable: 1,
                },
              ],
            },
          },
          {
            name: 'Disney+',
            slug: 'disney-plus',
            products: {
              create: [
                {
                  name: 'Disney+ Premium',
                  slug: 'disney-plus-premium',
                  description: '4K UHD and Dolby Atmos. Disney, Pixar, Marvel, Star Wars and National Geographic.',
                  price: 3.99,
                  imageUrl: 'https://placehold.co/400x300/113ccf/ffffff?text=Disney%2B',
                  slots: 4,
                  slotsAvailable: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })

  const music = await prisma.category.create({
    data: {
      name: 'Music',
      slug: 'music',
      subcategories: {
        create: [
          {
            name: 'Spotify',
            slug: 'spotify',
            products: {
              create: [
                {
                  name: 'Spotify Premium Family',
                  slug: 'spotify-premium-family',
                  description: 'Ad-free music for up to 6 accounts. Offline listening and full track control.',
                  price: 2.99,
                  imageUrl: 'https://placehold.co/400x300/1db954/ffffff?text=Spotify',
                  slots: 6,
                  slotsAvailable: 4,
                },
              ],
            },
          },
          {
            name: 'YouTube',
            slug: 'youtube',
            products: {
              create: [
                {
                  name: 'YouTube Premium Family',
                  slug: 'youtube-premium-family',
                  description: 'Ad-free YouTube, background play and YouTube Music included.',
                  price: 3.49,
                  imageUrl: 'https://placehold.co/400x300/ff0000/ffffff?text=YouTube',
                  slots: 5,
                  slotsAvailable: 0,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`Created categories: ${streaming.name}, ${music.name}`)
  console.log('Seeding finished.')
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })