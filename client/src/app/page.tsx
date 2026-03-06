import Container from "@/components/common/Container";
import BabyTravelSection from "@/components/home/BabyTravelSection";
import Banner from "@/components/home/Banner";
import CategoriesSection from "@/components/home/CategoriesSection";
import ComfyApparelSection from "@/components/home/ComfyApparelSection";
import FeaturedServicesSection from "@/components/home/FeaturedServicesSection";
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
          <BabyTravelSection/>
          <ComfyApparelSection/>
          <FeaturedServicesSection/>
        </div>
      </Container>
    </div>
  );
}
