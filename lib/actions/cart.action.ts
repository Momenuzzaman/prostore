"use server";

import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import prisma from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const addItemToCart = async (
  item: CartItem
): Promise<{ success: boolean; message: string }> => {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");
    // get session and user ID

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // get cart
    const cart = await getMyCart();

    const parsedItem = cartItemSchema.parse(item);

    const product = await prisma.product.findFirst({
      where: { id: parsedItem.productId },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [parsedItem],
        sessionCartId: sessionCartId,
        ...calcPrice([parsedItem]),
      });

      // Add to database
      await prisma.cart.create({ data: newCart });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart successfully`,
      };
    } else {
      const existItem = (cart.items as CartItem[]).find(
        (item) => item.productId === parsedItem.productId
      );
      if (existItem) {
        if (product.stock < existItem.qty + 1) {
          throw new Error("Product out of stock");
        }
        (cart.items as CartItem[]).find(
          (item) => item.productId === parsedItem.productId
        )!.qty = existItem.qty + 1;
      } else {
        if (product.stock < 1) {
          throw new Error("Product out of stock");
        }
        (cart.items as CartItem[]).push(parsedItem);
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } to cart `,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
};

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");
  // get session and user ID

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");

    // get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const exist = (cart.items as CartItem[]).find(
      (item) => item.productId === productId
    );
    if (!exist) throw new Error("Product not found in cart");

    if (exist.qty === 1) {
      // remove product
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      // decrease qty
      (cart.items = cart.items as CartItem[]).find(
        (item) => item.productId === productId
      )!.qty = exist.qty - 1;
    }
    // update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
