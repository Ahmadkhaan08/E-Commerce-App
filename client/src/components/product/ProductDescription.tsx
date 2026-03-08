"use client";
import { Product } from "@/types/type";
import React, { useState } from "react";
import { Tabs, TabsList } from "../ui/tabs";

interface Props {
  product: Product;
}
const ProductDescription = ({ product }: Props) => {
  const [active, setActive] = useState("description");
  return (
    <div>
      <Tabs>
        <TabsList></TabsList>
      </Tabs>
    </div>
  );
};

export default ProductDescription;
