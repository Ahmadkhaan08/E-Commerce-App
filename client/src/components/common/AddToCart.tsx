"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/type";
import { toast } from "sonner";
import { useCartStore, useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  className?: string;
}
const AddToCart = ({ product, className }: Props) => {
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const { isAuthenticated } = useUserStore();
  const { addToCart } = useCartStore();
  const router = useRouter();
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth/signin");
      return;
    }
    setLocalLoading(true);
    try {
      await addToCart(product, 1);
      toast.success("Added to cart successfully", {
        description: `Name: ${product?.name}`,
      });
    } catch (error) {
      console.log("Add to cart error:", error);
      toast.error("Failed to add cart,Please try again!");
    } finally {
      setLocalLoading(false);
    }
  };
  return (
    <Button
      onClick={handleAddToCart}
      className={cn("rounded-full px-6 mt-1", className)}
      variant={"outline"}
    >
      {localLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2 " />
          Adding....
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2 " />
          Add to cart
        </>
      )}
    </Button>
  );
};

export default AddToCart;
