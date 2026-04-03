import ShopPageClient from "@/components/pages/shop/ShopPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category } from "@/types/type";
import React from "react";
interface CategoryResponse {
  category: Category[];
}

const ShopPage = async () => {
  let brands: Brand[] = [];
  let categories: Category[] = [];

  try {
    brands = await fetchData<Brand[]>("/brands");
  } catch (error) {
    console.error("Failed to load brands for shop page:", error);
  }

  try {
    const response = await fetchData<CategoryResponse>("/categories");
    categories = response?.category;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred!";
    console.log("Error:", errorMessage);
  }

  return <ShopPageClient categories={categories} brands={brands} />;
};

export default ShopPage;
