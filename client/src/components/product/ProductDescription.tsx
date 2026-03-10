"use client";
import { Product } from "@/types/type";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface Props {
  product: Product;
}
const ProductDescription = ({ product }: Props) => {
  const [active, setActive] = useState("description");
  return (
    <div className="w-full">
      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger
            value="description"
            className="py-2 text-babyshopBlack hover:text-babyshopSky rounded-lg transition-all data-[state=active]:bg-babyshopSky data-[state=active]:text-babyshopWhite "
          >
            Description
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProductDescription;
