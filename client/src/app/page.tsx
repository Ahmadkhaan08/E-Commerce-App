import Container from "@/components/common/Container";
import Banner from "@/components/home/Banner";
import CategoriesSection from "@/components/home/CategoriesSection";
import HomeBrand from "@/components/home/HomeBrand";
import ProductList from "@/components/home/ProductList";
import { fetchData } from "@/lib/api";
import { Brand } from "@/types/type";

export default async function Home() {
  const brands=await fetchData<Brand[]>("/brands")
  // console.log(brands)
  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        <CategoriesSection />
        <div className="flex-1 ">
          <Banner />
          <ProductList/>
          <HomeBrand brands={brands}/>
        </div>
        {/* Product List */}
        {/* Baby Travel Section */}
        {/* Confy Apparel Section */}
        {/* Featured Services Section */}
      </Container>
    </div>
  );
}
