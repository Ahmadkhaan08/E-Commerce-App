"use client";

import { Product } from "@/types/type";
import { addToWishlist, getUserWishlist, getWishlistProducts, removeFromWishlist } from "@/lib/wishlistApi";
import { useUserStore, useWishlistStore } from "@/lib/store";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export const useWishlist = () => {
  const { auth_token, isAuthenticated } = useUserStore();

  const {
    wishlistIds,
    wishlistItems,
    addToWishlist: addLocal,
    removeFromWishlist: removeLocal,
    setWishlistItems,
    setWishlistIds,
  } = useWishlistStore();

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const syncWishlist = useCallback(async () => {
    if (!auth_token) {
      return;
    }

    const idsResponse = await getUserWishlist(auth_token);
    if (!idsResponse.success) {
      return;
    }

    const ids = idsResponse.wishlist || [];
    setWishlistIds(ids);

    if (ids.length === 0) {
      setWishlistItems([]);
      return;
    }

    const productsResponse = await getWishlistProducts(ids, auth_token);
    if (productsResponse.success) {
      setWishlistItems(productsResponse.products);
    }
  }, [auth_token, setWishlistIds, setWishlistItems]);

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const exists = wishlistIds.includes(product._id);

      if (!isAuthenticated || !auth_token) {
        if (exists) {
          removeLocal(product._id);
          toast.success("Removed from wishlist");
        } else {
          addLocal(product);
          toast.success("Added to wishlist");
        }
        return;
      }

      if (exists) {
        removeLocal(product._id);
        try {
          const response = await removeFromWishlist(product._id, auth_token);
          if (response.success) {
            setWishlistIds(response.wishlist);
            toast.success("Removed from wishlist");
          }
        } catch (error) {
          addLocal(product);
          toast.error("Failed to update wishlist");
          throw error;
        }
        return;
      }

      addLocal(product);
      try {
        const response = await addToWishlist(product._id, auth_token);
        if (response.success) {
          setWishlistIds(response.wishlist);
          toast.success("Added to wishlist");
        }
      } catch (error) {
        removeLocal(product._id);
        toast.error("Failed to update wishlist");
        throw error;
      }
    },
    [wishlistIds, isAuthenticated, auth_token, addLocal, removeLocal, setWishlistIds],
  );

  const wishlistCount = useMemo(() => wishlistIds.length, [wishlistIds]);

  return {
    wishlistIds,
    wishlistItems,
    wishlistCount,
    isInWishlist,
    syncWishlist,
    toggleWishlist,
    isAuthenticated,
    auth_token,
  };
};
