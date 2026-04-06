"use client";
import { Product } from "@/types/type";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import WishlistButton from "../common/WishlistButton";
import { Button } from "../ui/button";

interface Props {
  product: Product;
}
const ProductActions: React.FC<Props> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  // const [localLoading, setLocalLoading] = useState(false);
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };
  return (
    <>
      {/* Product name with wishlist button */}
      <div className="flex items-center justify-between gap-5">
        <h1 className="text-2xl font-bold line-clamp-1 mt-2">
          {product?.name}
        </h1>
        <div className="flex items-center gap-2">
          <WishlistButton
            product={product}
            className="border border-babyshopTextLight hover:border-babyshopSky"
          />
        </div>
      </div>

      {/* Quantity with Add to cart button */}
      <div>
        <p className="mb-2">Quantity</p>
        <div className="flex items-center gap-5">
          <div className="border flex items-center gap-6 px-5 py-2 rounded-full">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="border-0 bg-transparent text-babyshopBlack hover:text-babyshopSky hoverEffect"
            >
              <Minus size={18} />
            </button>
            <span className="font-medium text-base">{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="border-0 bg-transparent text-babyshopBlack hover:text-babyshopSky hoverEffect"
            >
              <Plus size={18} />
            </button>
          </div>
          <Button
            className="flex-1  border-babyshopTextLight hover:border-babyshopSky hover:bg-babyshopSky hover:text-babyshopWhite text-base font-medium"
            variant={"outline"}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductActions;
