"use server";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { convertToPlainObject } from "../utils";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function getLatestProducts() {
  try {
    const data = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    });
    return convertToPlainObject(data);
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}
