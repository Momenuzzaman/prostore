"use client";
import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
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
  };

  return (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      Add To Cart
    </Button>
  );
};

export default AddToCart;
