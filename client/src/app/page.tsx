import Container from "@/components/common/Container";
import Banner from "@/components/home/Banner";
import CategoriesSection from "@/components/home/CategoriesSection";
import ProductList from "@/components/home/ProductList";

export default function Home() {
  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        <CategoriesSection />
        <div className="flex-1 ">
          <Banner />
          <ProductList/>
        </div>
        {/* Product List */}
        {/* Baby Travel Section */}
        {/* Confy Apparel Section */}
        {/* Featured Services Section */}
      </Container>
    </div>
  );
}
