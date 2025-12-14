// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { updateUserPayment } from "@/lib/actions/user.action";

// import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
// import { paymentMethodSchema } from "@/lib/validators";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { ArrowRight, Loader } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useTransition } from "react";
// import { Form, SubmitHandler, useForm } from "react-hook-form";

// import { toast } from "sonner";
// import z from "zod";

// const PaymentMethodForm = ({
//   preferredPaymentMethod,
// }: {
//   preferredPaymentMethod: string | null;
// }) => {
//   const form = useForm<z.infer<typeof paymentMethodSchema>>({
//     resolver: zodResolver(paymentMethodSchema),
//     defaultValues: {
//       type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
//     },
//   });
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();

//   // Infer TypeScript type from Zod schema
//   type PaymentMethod = z.infer<typeof paymentMethodSchema>;
//   const onSubmit: SubmitHandler<PaymentMethod> = async (values) => {
//     startTransition(async () => {
//       const res = await updateUserPayment(values);
//       if (!res.success) {
//         toast.error(res.message);
//         return;
//       }
//       router.push("/place-order");
//     });
//   };

//   return (
//     <div>
//       <div className="max-w-md mx-auto space-y-4">
//         <h1 className="h2-bold mt-4">Payment Method</h1>
//         <p className="text-sm text-muted-foreground">
//           Select your preferred payment method
//         </p>

//         <Form {...form}>
//           <form
//             method="post"
//             className="space-y-4"
//             onSubmit={form.handleSubmit(onSubmit)}
//           >
//             <div className="flex flex-col md:flex-row gap-5">
//               <FormField
//                 control={form.control}
//                 name="type"
//                 render={({ field }) => (
//                   <FormItem className="space-y-3">
//                     <FormControl>
//                       <RadioGroup
//                         className="flex-col space-y-2"
//                         onValueChange={field.onChange}
//                       >
//                         {PAYMENT_METHODS.map((method) => (
//                           <FormItem
//                             key={method}
//                             className="flex items-center space-x-3 space-y-0"
//                           >
//                             <FormControl>
//                               <RadioGroupItem
//                                 value={method}
//                                 checked={field.value === method}
//                               />
//                             </FormControl>
//                             <FormLabel className="font-medium">
//                               {method}
//                             </FormLabel>
//                           </FormItem>
//                         ))}
//                       </RadioGroup>
//                     </FormControl>

//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Submit button */}
//             <Button type="submit" disabled={isPending} className="flex gap-2">
//               {isPending ? (
//                 <Loader className="h-4 w-4 animate-spin" />
//               ) : (
//                 <ArrowRight className="w-4 h-4" />
//               )}
//               Continue
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// };
// export default PaymentMethodForm;

"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserPayment } from "@/lib/actions/user.action";

import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import { paymentMethodSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form"; // ✅ FIXED
import { Form } from "@/components/ui/form"; // ✅ FIXED

import { toast } from "sonner";
import z from "zod";

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  type PaymentMethod = z.infer<typeof paymentMethodSchema>;

  const onSubmit: SubmitHandler<PaymentMethod> = async (values) => {
    startTransition(async () => {
      const res = await updateUserPayment(values);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      router.push("/place-order");
    });
  };

  return (
    <div>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Payment Method</h1>
        <p className="text-sm text-muted-foreground">
          Select your preferred payment method
        </p>

        <Form {...form}>
          <form
            method="post"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        className="flex-col space-y-2"
                        onValueChange={field.onChange}
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <FormItem
                            key={method}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={method}
                                checked={field.value === method}
                              />
                            </FormControl>
                            <FormLabel className="font-medium">
                              {method}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending} className="flex gap-2">
              {isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Continue
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
