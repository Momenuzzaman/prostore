"use server";

import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { convertToPlainObject } from "../utils";
import prisma from "@/db/prisma";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

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

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug: slug },
  });
}
