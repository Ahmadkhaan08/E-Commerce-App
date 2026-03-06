"use client";
import React from "react";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/type";
import { toast } from "sonner";

interface Props {
  product: Product;
  className?: string;
}
const AddToCart = ({ product, className }: Props) => {
    const handleAddToCart=()=>{
        toast.success("Please login first to add to cart!")
    }
  return (
    <Button
    onClick={handleAddToCart}
      className={cn("rounded-full px-6 mt-1", className)}
      variant={"outline"}
    >
      <ShoppingCart className="h-4 w-4 mr-2 " />
      Add to cart
    </Button>
  );
};

export default AddToCart;
