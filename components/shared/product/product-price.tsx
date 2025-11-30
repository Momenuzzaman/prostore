import { cn } from "@/lib/utils";

const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const stringValue = value.toFixed(2);
  const [integerPart, decimalPart] = stringValue.split(".");

  return (
    <p className={cn("text-2xl font-semibold", className)}>
      <span className="text-xs -translate-y-2 inline-block text-center">$</span>
      {integerPart}
      <span className="text-xs -translate-y-2 inline-block">
        .{decimalPart}
      </span>
    </p>
  );
};

export default ProductPrice;
