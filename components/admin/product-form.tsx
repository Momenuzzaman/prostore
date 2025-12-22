"use client";

import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, Resolver, Form } from "react-hook-form";
import z from "zod";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();

  const form = useForm<
    z.infer<typeof insertProductSchema> | z.infer<typeof updateProductSchema>
  >({
    resolver: zodResolver(
      type === "Update" ? updateProductSchema : insertProductSchema
    ) as Resolver<
      z.infer<typeof insertProductSchema> | z.infer<typeof updateProductSchema>
    >,
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });
  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="flex flex-col md:flex-row gap-5"></div>
        <div className="flex flex-col md:flex-row gap-5"></div>
        <div className="flex flex-col md:flex-row gap-5"></div>
        <div className="flex flex-col md:flex-row gap-5 upload-filed"></div>
        <div className="upload-filed"></div>
        <div></div>
        <div></div>
      </form>
    </Form>
  );
};

export default ProductForm;
