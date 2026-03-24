"use client";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchData } from "@/lib/api";
import { Brand, Category, Product } from "@/types/type";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface ProductsResponse {
  products: Product[];
  total: number;
}
interface Props {
  categories: Category[];
  brands: Brand[];
}
const ShopPageClient = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | null>(
    searchParams.get("category") || "",
  );
  const [brand, setBrand] = useState<string>(searchParams.get("brand") || "");
  const [search, setSearch] = useState<string>(
    searchParams.get("search") || "",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newlyLoadedProducts, setNewlyLoadedProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [inValidCategory, setInvalidCategory] = useState<string | null>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const productsPerPage = 10;

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    // Check by ID
    const categoryExist = categories.some((cat) => cat._id === categoryFromUrl);
    // Check By Name
    const categoryName = categories.find(
      (cat) =>
        cat.name.toLocaleLowerCase() === categoryFromUrl?.toLocaleLowerCase(),
    );
    if (categoryExist || categoryName) {
      setCategory(categoryFromUrl);
    } else {
      setInvalidCategory(categoryFromUrl);
      setCategory("");
    }
  }, [searchParams, categories]);

  const fetchProducts = useCallback(
    async (loadingMore = false) => {
      if (loadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (brand) params.append("brand", brand);
        if (search) params.append("search", search);
        if (priceRange) {
          params.append("priceMin", priceRange[0].toString());
          params.append("priceMax", priceRange[1].toString());
        }
        params.append("page", currentPage.toString());
        params.append("limit", productsPerPage.toString());
        params.append("sortOrder", sortOrder);

        const response: ProductsResponse = await fetchData(
          `/products?${params.toString()}`,
        );
        console.log("res:", response);
        setTotal(response?.total);
        if (loadingMore) {
          setNewlyLoadedProducts(response.products);
          setProducts((prev) => [...prev, ...response.products]);
        } else {
          setNewlyLoadedProducts([]);
          setProducts(response.products);
        }
      } catch (error) {
        console.log("Failed to fetched Products", error);
        setTotal(0);
        if (!loadingMore) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      category,
      brand,
      search,
      priceRange,
      sortOrder,
      productsPerPage,
      currentPage,
    ],
  );

  useEffect(() => {
    fetchProducts();
    // setCurrentPage(1)
  }, [category, brand, search, priceRange, sortOrder]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(true);
    }
  }, [currentPage, fetchProducts]);

  useEffect(() => {
    if (newlyLoadedProducts.length > 0) {
      const timer = setTimeout(() => {
        setNewlyLoadedProducts([]);
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [newlyLoadedProducts]);
  const totalPages = Math.ceil(total / productsPerPage);
  // console.log("Total:",totalPages)
  const hasMoreProducts = products.length < total && currentPage < totalPages;
  const priceRanges: [number, number][] = [
    [0, 500],
    [500, 1000],
    [1000, 1500],
    [1500, 2000],
    [2000, Infinity],
  ];

  const loadMoreProducts = () => {
    if (hasMoreProducts && !loadingMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const resetCategory = () => {
    setCategory("");
    setCurrentPage(1);
    setInvalidCategory("");
  };

  const resetBrand = () => {
    setBrand("");
    setCurrentPage(1);
  };
  const resetSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };
  const resetPriceRange = () => {
    setPriceRange(null);
    setCurrentPage(1);
  };
  const resetSortOrder = () => {
    setSortOrder("asc");
    setCurrentPage(1);
  };
  const resetAllFilters = () => {
    setCategory("");
    setBrand("");
    setSearch("");
    setPriceRange(null);
    setSortOrder("asc");
    setCurrentPage(1);
    setInvalidCategory("");
  };

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-semibold">Shop Products</h2>
          <p className="text-babyshopBlack/70 font-medium">
            {loading
              ? "Loading...."
              : `Showing ${products.length} of ${total} products`}
          </p>
          {inValidCategory && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md py-1 px-2">
              <p className="text-sm text-yellow-800">
                Category &quot;{inValidCategory}&quot; not found.Showing all
                products instead.
              </p>
            </div>
          )}
        </div>
        <div>
          {(category ||
            brand ||
            search ||
            priceRange ||
            sortOrder !== "asc") && (
            <Button
              variant={"outline"}
              onClick={resetAllFilters}
              className="text-sm border-babyshopSky hover:bg-babyshopSky/20"
              disabled={loading}
            >
              Reset All Filters
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="p-5 bg-babyshopWhite w-full md:max-w-64  min-w-60 rounded-lg border">
          <div className="hidden md:block mb-4 ">
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <div
            className={`${isFiltersOpen ? "block" : "hidden"} md:block space-y-4`}
          >
            {search && (
              <div>
                <h3 className="text-sm font-medium mb-3">Search</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                    `&quot;`{search}`&quot;`
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      onClick={resetSearch}
                      disabled={loading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                </div>
              </div>
            )}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                {category && (
                  <Button
                    variant={"link"}
                    disabled={loading}
                    onClick={resetCategory}
                    className="text-xs text-blue-600 p-0"
                    size={"sm"}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <Select value={category || "All"}
              onValueChange={(value)=>{
                setCategory(value==="All"?"":value)
                setCurrentPage(1)
                setInvalidCategory("")
              }}
              disabled={loading}>
                <SelectTrigger className="w-full p-2 rounded-md border">
                  <SelectValue placeholder="Select a category"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((cat:Category)=>(
                      <SelectItem key={cat?._id} value={cat?.name}>{cat?.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div>Products</div>
      </div>
    </Container>
  );
};

export default ShopPageClient;
