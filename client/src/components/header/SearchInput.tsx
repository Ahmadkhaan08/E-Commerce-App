"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Loader2, Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Product } from "@/types/type";
import { toast } from "sonner";
import { fetchData } from "@/lib/api";

interface ProductsResponse {
  products: Product[];
  total: number;
}
const SearchInput = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchData<ProductsResponse>("/products");
      setFeaturedProducts(response.products);
      // console.log(response);
    } catch (error) {
      console.log("Error in fetching Featured Products", error);
      toast.error("Failed in fetching Featured Products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event?.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showSearch]);
  const toggleMobileSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearch("");
      setShowResults(true);
    }
  };
  // console.log(search)
  return (
    <div ref={searchRef} className="relative lg:w-full">
      {/* Small Screen  Search */}
      <button
        onClick={toggleMobileSearch}
        className="lg:hidden mt-1.5 border p-2 rounded-full hover:border-babyshopSky hover:bg-babyshopSky/10 hoverEffect "
      >
        {showSearch ? (
          <X className="w-5 h-5 text-babyshopBlack group-hover:text-babyshopRed hoverEffect" />
        ) : (
          <Search className="w-5 h-5 text-babyshopBlack group-hover:text-babyshopRed hoverEffect" />
        )}
      </button>
      <form
        className="relative hidden lg:flex items-center"
        onSubmit={(e) => e.preventDefault()}
      >
        <Input
          placeholder="Search Products......"
          className="flex-1 rounded-md py-5 focus-visible:ring-0 focus-visible:border-babyshopRed bg-white text-babyshopTextLight placeholder:font-semibold placeholder:tracking-wide pr-16"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search ? (
          <X
            onClick={() => setSearch("")}
            className="w-5 h-5 absolute right-3 top-2.5 text-babyshopTextLight hover:text-babyshopRed hoverEffect cursor-pointer"
          />
        ) : (
          <Search className="w-5 h-5 absolute right-3 top-2.5 text-babyshopTextLight" />
        )}
      </form>
      {/* Desktop search results dropdown */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center px-6 py-4 gap-2 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-babyshopRed"/>
            <span className="font-medium text-gray-600">Searching....</span>
          </div>
        ) : products.length > 0 ? (
          <div></div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
