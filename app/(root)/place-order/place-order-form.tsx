import { Button } from "@/components/ui/button";
import { createOder } from "@/lib/actions/order.actions";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/router";
import { useFormStatus } from "react-dom";

const PlaceOrderForm = () => {
  // Assuming this is used for navigation after the order is placed
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await createOder();
    if (res.redirectTo) {
      router.push(res.redirectTo);
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}{" "}
        Place Order
      </Button>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
      <PlaceOrderButton />
    </form>
  );
};

export default PlaceOrderForm;
