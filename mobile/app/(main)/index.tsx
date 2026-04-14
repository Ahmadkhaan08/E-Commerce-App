import BannerCarousel from "@/components/home-screen/BannerCarousel";
import BrandList from "@/components/home-screen/BrandList";
import CategoryList from "@/components/home-screen/CategoryList";
import MobileFooter from "@/components/footer/MobileFooter";
import Header from "@/components/home-screen/Header";
import ProductSlider from "@/components/home-screen/ProductSlider";
import PromoBanner from "@/components/home-screen/PromoBanner";
import { getBaseUrl } from "@/constants/api";
import { Banners, Brand, Category, Product } from "@/types/type";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type ProductResponse = {
  products: Product[];
  total: number;
};

type CategoryResponse = {
  category: Category[];
};

type Promotion = {
  _id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
};

const FALLBACK_CATEGORIES = [
  "Diapers",
  "Toys",
  "Clothes",
  "Feeding",
].map((name, index) => ({
  _id: `fallback-category-${index}`,
  name,
  image: "",
  categoryType: "Featured",
}));

const EMPTY_PROMOTION: Promotion = {
  title: "Travel Smart",
  subtitle: "Discover top-rated baby essentials at great prices",
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

function getDeals(products: Product[]) {
  return [...products]
    .sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0))
    .slice(0, 10);
}

function getTrending(products: Product[]) {
  return [...products]
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 10);
}

export default function Index() {
  const [banners, setBanners] = useState<Banners[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    const baseUrl = getBaseUrl();

    const [bannersResult, categoriesResult, dealsResult, trendingResult, brandsResult, productsResult, promotionsResult, cartResult] =
      await Promise.allSettled([
        fetchJson<Banners[]>(`${baseUrl}/api/banners`),
        fetchJson<CategoryResponse>(`${baseUrl}/api/categories?perPage=30`),
        fetchJson<ProductResponse>(`${baseUrl}/api/products/deals`),
        fetchJson<ProductResponse>(`${baseUrl}/api/products/trending`),
        fetchJson<Brand[]>(`${baseUrl}/api/brands`),
        fetchJson<ProductResponse>(`${baseUrl}/api/products?limit=30`),
        fetchJson<Promotion[]>(`${baseUrl}/api/promotions`),
        fetchJson<{ cart?: { quantity?: number }[] }>(`${baseUrl}/api/carts`),
      ]);

    const allProducts =
      productsResult.status === "fulfilled" && Array.isArray(productsResult.value.products)
        ? productsResult.value.products
        : [];

    setBanners(bannersResult.status === "fulfilled" ? bannersResult.value : []);

    if (categoriesResult.status === "fulfilled" && Array.isArray(categoriesResult.value.category)) {
      setCategories(categoriesResult.value.category);
    } else {
      setCategories(FALLBACK_CATEGORIES);
    }

    if (dealsResult.status === "fulfilled" && Array.isArray(dealsResult.value.products)) {
      setDeals(dealsResult.value.products);
    } else {
      setDeals(getDeals(allProducts));
    }

    if (trendingResult.status === "fulfilled" && Array.isArray(trendingResult.value.products)) {
      setTrending(trendingResult.value.products);
    } else {
      setTrending(getTrending(allProducts));
    }

    setBrands(brandsResult.status === "fulfilled" ? brandsResult.value : []);

    if (promotionsResult.status === "fulfilled" && Array.isArray(promotionsResult.value) && promotionsResult.value.length > 0) {
      setPromotion(promotionsResult.value[0]);
    } else if (bannersResult.status === "fulfilled" && bannersResult.value.length > 0) {
      setPromotion({
        _id: bannersResult.value[0]._id,
        title: bannersResult.value[0].name,
        subtitle: bannersResult.value[0].title,
        image: bannersResult.value[0].image,
      });
    } else {
      setPromotion(EMPTY_PROMOTION);
    }

    if (cartResult.status === "fulfilled" && Array.isArray(cartResult.value.cart)) {
      const count = cartResult.value.cart.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
      setCartCount(count);
    } else {
      setCartCount(0);
    }

    const failed = [
      bannersResult,
      categoriesResult,
      dealsResult,
      trendingResult,
      brandsResult,
    ].filter((result) => result.status === "rejected");

    setError(
      failed.length > 0
        ? "Some home sections could not load from backend and are using graceful fallbacks."
        : null,
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, [loadHomeData]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadHomeData();
      setLoading(false);
    };

    run();
  }, [loadHomeData]);

  const isEmpty = !loading && banners.length === 0 && categories.length === 0 && deals.length === 0 && trending.length === 0;

  const activePromo = promotion ?? EMPTY_PROMOTION;

  return (
    <View className="flex-1 bg-[#edf3ff]">
      <View className="flex-1">
        <ScrollView
          stickyHeaderIndices={[0]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7f8ff5" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Header cartCount={cartCount} />

          <View className="px-4">
            {loading ? (
              <View className="mt-16 items-center justify-center">
                <ActivityIndicator size="large" color="#7f8ff5" />
                <Text className="mt-2 text-sm text-[#7080a7]">Loading baby shop home...</Text>
              </View>
            ) : null}

            {!loading ? (
              <>
                {error ? (
                  <View className="mt-4 rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-3">
                    <Text className="text-xs font-medium text-[#6e7a97]">{error}</Text>
                  </View>
                ) : null}

                {isEmpty ? (
                  <View className="mt-16 items-center rounded-2xl border border-[#dce7ff] bg-[#f8fbff] p-6">
                    <Text className="text-base font-bold text-[#1f2a44]">No home content available yet</Text>
                    <Text className="mt-1 text-center text-xs text-[#6e7a97]">Pull to refresh and check backend connectivity.</Text>
                  </View>
                ) : (
                  <>
                    <BannerCarousel
                      banners={banners}
                      onPressShopNow={() => router.push({ pathname: "/(main)/search" as any })}
                    />

                    <CategoryList categories={categories} onSeeAll={() => router.push({ pathname: "/(main)/search" as any })} />

                    <ProductSlider title="Baby Deals" products={deals} onSeeAll={() => router.push({ pathname: "/(main)/search" as any })} />

                    <ProductSlider title="Trending" products={trending} onSeeAll={() => router.push({ pathname: "/(main)/search" as any })} />

                    <BrandList brands={brands} onSeeAll={() => router.push({ pathname: "/(main)/search" as any })} />

                    <PromoBanner
                      title={activePromo.title || "Travel Smart"}
                      subtitle={activePromo.subtitle || "Discover top-rated baby essentials at great prices"}
                      onPress={() => router.push({ pathname: "/(main)/search" as any })}
                    />

                    <MobileFooter
                      onPressAbout={() => router.push("/(main)/about")}
                      onPressContact={() => router.push("/(main)/help-support")}
                      onPressTerms={() => router.push("/(main)/about")}
                    />
                  </>
                )}
              </>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
