import ShopPageClient from "@/components/pages/shop/ShopPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category } from "@/types/type";
import React from "react";

export const dynamic = "force-dynamic";

interface CategoryResponse {
  category: Category[];
}

interface BrandResponse {
  brand?: Brand[];
  brands?: Brand[];
}

const ShopPage = async () => {
  let brands: Brand[] = [];
  let categories: Category[] = [];

  try {
    const brandResponse = await fetchData<Brand[] | BrandResponse>("/brands", {
      cache: "no-store",
    });
    brands = Array.isArray(brandResponse)
      ? brandResponse
      : (brandResponse.brand ?? brandResponse.brands ?? []);
  } catch (error) {
    console.error("Failed to load brands for shop page:", error);
  }

  try {
    const response = await fetchData<CategoryResponse>("/categories");
    categories = Array.isArray(response?.category) ? response.category : [];
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred!";
    console.log("Error:", errorMessage);
  }

  return <ShopPageClient categories={categories} brands={brands} />;
};

export default ShopPage;
