import { Product } from "@/types/type";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DiscountBadge from "./DiscountBadge";
import PriceContainer from "./PriceContainer";
import AddToCart from "./AddToCart";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border rounded-md group overflow-hidden relative w-full">
      <Link
        href={`/products/${product?._id}`}
        className="p-2 overflow-hidden relative block"
      >
        <Image
          src={product?.image as string}
          alt="ProductImage"
          width={500}
          height={500}
          className="w-full h-32 object-cover group-hover:scale-110 hoverEffect"
        />
        <DiscountBadge
          discountPercentage={product?.discountPercentage}
          className="absolute top-4 left-2"
        />
      </Link>
      {/* Whislist Button */}
      <hr />
      <div className="px-4 py-2 space-y-1">
        <p className="uppercase text-xs font-medium text-babyshopTextLight">
          {product?.category?.name}
        </p>
        <p className="line-clamp-2 text-sm h-10">{product?.name}</p>
        <PriceContainer
          price={product?.price}
          discountPercentage={product?.discountPercentage}
        />
        <AddToCart product={product} className="hover:bg-babyshopSky/20 border-babyshopSky"/>
      </div>
    </div>
  );
};

export default ProductCard;
