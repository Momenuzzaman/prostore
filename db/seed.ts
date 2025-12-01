// import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import sampleData from "./sample-data";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Delete all existing products
    await prisma.product.deleteMany({});

    for (const product of sampleData.products) {
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          category: product.category,
          description: product.description,
          image: product.images ?? [],
          price: product.price,
          brand: product.brand,
          rating: product.rating,
          numReviews: product.numReviews,
          stock: product.stock,
          isFeatured: product.isFeatured,
          banner: product.banner ?? undefined, // optional field
        },
      });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
