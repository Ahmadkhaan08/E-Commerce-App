import ShopPageClient from "@/components/pages/shop/ShopPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category } from "@/types/type";
import React from "react";
interface CategoryResponse{
    category:Category[]
}
const ShopPage = async () => {
  const brands = await fetchData<Brand[]>("/brands");
  let categories: Category[] = [];
  let error: string | null = null;
  try {
    const response=await fetchData<CategoryResponse>("/categories")
    categories=response?.category
  } catch (err) {
    error = err instanceof Error ? err.message:"An unknown error occured!"
    console.log("Error:",error);
  }
//   console.table(categories);
//   console.table(brands);
  return (
    <ShopPageClient categories={categories} brands={brands}/>
  );
};

export default ShopPage;
