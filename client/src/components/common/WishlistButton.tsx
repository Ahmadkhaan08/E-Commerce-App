"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/types/type";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useWishlist } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  iconClassName?: string;
  size?: number;
}

const WishlistButton = ({ product, className, iconClassName, size = 20 }: WishlistButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const active = useMemo(() => isInWishlist(product._id), [isInWishlist, product._id]);

  const handleToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await toggleWishlist(product);
    } catch {
      // toast and rollback are handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      animate={{ scale: active ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.25 }}
      onClick={handleToggle}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-babyshopTextLight/40 bg-white/90 transition-all hover:border-babyshopSky hover:shadow-sm",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-babyshopSky" />
      ) : (
        <Heart
          size={size}
          className={cn(
            "transition-colors",
            active ? "fill-babyshopRed text-babyshopRed" : "text-babyshopBlack",
            iconClassName,
          )}
        />
      )}
    </motion.button>
  );
};

export default WishlistButton;
