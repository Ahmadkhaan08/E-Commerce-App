import { Product } from "@/types/type";
import { getBaseUrl } from "@/constants/api";

interface ProductResponse {
  products: Product[];
  total: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const apiBaseUrl = getBaseUrl();

  const response = await fetch(`${apiBaseUrl}/api/products`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products (${response.status})`);
  }

  const data = (await response.json()) as ProductResponse;

  return Array.isArray(data?.products) ? data.products : [];
};