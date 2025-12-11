"use client";
import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { Cart, CartItem } from "@/types";
import { Loader, Minus, Plus } from "lucide-react";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      console.log(res);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        action: {
          label: (
            <span className="bg-primary text-white hover:bg-gray-800">
              Go To Cart
            </span>
          ),
          onClick: () => router.push("/cart"),
        },
      });
    });
  };

  // handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      toast.success(res.message);
    });
  };

  // check if item exist in cart
  const existItem = cart?.items.find(
    (product) => product.productId === item.productId
  );

  return existItem ? (
    <div>
      <Button variant="outline" type="button" onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button variant="outline" type="button" onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}{" "}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
