"use client";

import { useWishlistStore } from "@/lib/store";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

const WhishlistIcon = () => {
  const [isMounted, setIsMounted] = useState(false);
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = useMemo(() => wishlistIds.length, [wishlistIds.length]);

  return (
     <Link
      href={"/wishlist"}
      className="relative hover:text-babyshopSky hoverEffect"
    >
      <Heart size={24} />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full items-center justify-center flex">
        {isMounted ? (totalItems > 99 ? "99+" : totalItems) : 0}
      </span>
    </Link>
  );
};

export default WhishlistIcon;