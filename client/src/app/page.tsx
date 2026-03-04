import Container from "@/components/common/Container";
import CategoriesSection from "@/components/home/CategoriesSection";

export default function Home() {
  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        <CategoriesSection />
        <div className="flex-1 bg-red-100">
          {/* Banner */}
          Banner
        </div>
        {/* Product List */}
        {/* Baby Travel Section */}
        {/* Confy Apparel Section */}
        {/* Featured Services Section */}
      </Container>
    </div>
  );
}
