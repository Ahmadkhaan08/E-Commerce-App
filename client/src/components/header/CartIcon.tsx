"use client";
import { useCartStore } from "@/lib/store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const CartIcon = () => {
  const { cartItemsWithQuantities } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Prevent hydration mismatch by not rendering cart count on server
  if (!isMounted) {
    return (
      <Link
        href={"/user/cart"}
        className="relative hover:text-babyshopSky hoverEffect"
      >
        <ShoppingBag />
        <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          0
        </span>
      </Link>
    );
  }

  const totalItems = cartItemsWithQuantities.length;

  return (
    <Link
      href={"/user/cart"}
      className="relative hover:text-babyshopSky hoverEffect"
    >
      <ShoppingBag size={24} />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full items-center justify-center flex">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </Link>
  );
};

export default CartIcon;
