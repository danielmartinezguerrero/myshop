import prisma from '../src/lib/prisma'

// Refills slots without touching products, orders or carts.
// Handy during development after testing the checkout flow.
const main = async () => {
  const products = await prisma.product.findMany()

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      // Reset availability back to the product's full capacity
      data: { slotsAvailable: product.slots },
    })
  }

  console.log(`Restocked ${products.length} products to full capacity.`)
}

main()
  .catch((error) => {
    console.error('Restock failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })