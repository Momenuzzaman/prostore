"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const ProductImages = ({ image }: { image: string[] }) => {
  const [currentImage, setCurrentImage] = useState(0);
  return (
    <div className="space-y-4">
      <Image
        src={image[currentImage]}
        alt="product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />
      <div className="flex">
        {image.map((img, index) => (
          <div
            key={index}
            onClick={() => setCurrentImage(index)}
            className={cn(
              "cursor-pointer mr-2 p-1 border rounded",
              currentImage === index && "border-2 border-orange-500"
            )}
          >
            <Image
              src={img}
              alt="image"
              width={100}
              height={100}
              className="object-cover rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProductImages;
