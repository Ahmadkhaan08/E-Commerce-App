"use client";

import Container from "@/components/common/Container";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const WishlistPageClient = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { addToCart } = useCartStore();
  const { wishlistItems, removeFromWishlist } =
    useWishlistStore();

  const { auth_token, syncWishlist } = useWishlist();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (auth_token) {
          await syncWishlist();
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [auth_token, syncWishlist]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      if (auth_token) {
        const { removeFromWishlist: removeRemote } = await import(
          "@/lib/wishlistApi"
        );
        const response = await removeRemote(productId, auth_token);
        if (response.success) {
          removeFromWishlist(productId);
          toast.success("Removed from wishlist");
        }
      } else {
        removeFromWishlist(productId);
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      toast.error("Failed to remove wishlist item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (productId: string) => {
    const target = wishlistItems.find((item) => item._id === productId);
    if (!target) {
      return;
    }

    if (!auth_token) {
      toast.error("Please sign in to move items to cart");
      router.push("/auth/signin");
      return;
    }

    setMovingId(productId);
    try {
      await addToCart(target, 1);

      const { removeFromWishlist: removeRemote } = await import(
        "@/lib/wishlistApi"
      );
      const response = await removeRemote(productId, auth_token);
      if (response.success) {
        removeFromWishlist(productId);
      }

      toast.success("Moved to cart");
    } catch (error) {
      console.error("Failed to move item to cart:", error);
      toast.error("Failed to move item to cart");
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index.toString()}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/3" />
              <Skeleton className="mt-5 h-10 w-full rounded-full" />
              <Skeleton className="mt-3 h-10 w-full rounded-full" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Container className="py-16">
        <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
              <Heart className="h-14 w-14 text-gray-300" />
            </div>
            <h1 className="text-3xl mb-4 font-bold text-gray-900">
              Your wishlist is empty
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              Save your favorite products so you can quickly come back to them.
            </p>
            <Link href="/shop">
              <Button
                size="lg"
                className=" text-white px-8 py-3 rounded-full font-medium"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageBreadCrumb items={[{ label: "Home", href: "/" }]} currentPage="Wishlist" />
      <div className="mb-8 mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-babyshopBlack">Wishlist</h1>
          <p className="text-gray-500 mt-1">
            {wishlistItems.length} item{wishlistItems.length > 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {wishlistItems.map((item) => (
          <div
            key={item._id}
            className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <Link
              href={`/product/${item._id}`}
              className="relative block h-48 w-full overflow-hidden rounded-xl bg-gray-50"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="mt-4">
              <Link href={`/product/${item._id}`}>
                <h3 className="line-clamp-2 text-base font-semibold text-gray-900 hover:text-babyshopSky transition-colors">
                  {item.name}
                </h3>
              </Link>
              <div className="mt-2">
                <PriceFormatter amount={item.price} className="text-lg font-bold text-babyshopRed" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Button
                className="w-full rounded-lg bg-babyshopSky hover:bg-babyshopSky/90"
                onClick={() => handleMoveToCart(item._id)}
                disabled={movingId === item._id}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {movingId === item._id ? "Moving..." : "Move to Cart"}
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-lg border-gray-300 hover:border-babyshopRed hover:text-babyshopRed"
                onClick={() => handleRemove(item._id)}
                disabled={removingId === item._id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {removingId === item._id ? "Removing..." : "Remove from Wishlist"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default WishlistPageClient;