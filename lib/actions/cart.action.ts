"use server";

import { CartItem } from "@/types";

export const addItemToCart = async (
  item: CartItem
): Promise<{ success: boolean; message: string }> => {
  return {
    success: true,
    message: "Item added to cart successfully",
  };
};
