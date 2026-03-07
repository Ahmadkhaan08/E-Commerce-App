import { payment } from "@/assets/image";
import BackToHome from "@/components/common/BackToHome";
import Container from "@/components/common/Container";
import DiscountBadge from "@/components/common/DiscountBadge";
import PriceFormatter from "@/components/common/PriceFormatter";
import ProductActions from "@/components/product/ProductActions";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/lib/api";
import { Product } from "@/types/type";
import { Box, Eye, FileQuestion, Share2, Star, Truck } from "lucide-react";
import Image from "next/image";
import React from "react";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  // console.log("ID:",id)
  const product: Product = await fetchData<Product>(`/products/${id}`);
  //   console.log("product",product)

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
        <h2 className="text-lg ">
          No product found with{" "}
          <span className="font-medium">
            #id:
            <span className="font-semibold underline text-babyshopSky">
              {id}
            </span>
          </span>
        </h2>
        <BackToHome />
      </div>
    );
  }
  return (
    <div className="pt-5 mx-4 ">
      <Container className="bg-babyshopWhite shadow-babyshopBlack/10 shadow-sm border border-babyshopTextLight rounded-xl grid grid-cols-1 md:grid-cols-2 gap-10 p-5 md:p-10">
        <div>
          <Image
            src={product?.image}
            alt="ProductImage"
            width={500}
            height={500}
          />
        </div>
        <div className="sapce-y-5">
          <DiscountBadge
            discountPercentage={product?.discountPercentage}
            className="w-14"
          />
          <ProductActions product={product} />
          {/* price view */}
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-2 mt-2">
              <PriceFormatter
                amount={product?.price}
                className="text-babyshopTextLight line-through font-medium text-lg"
              />
              <PriceFormatter amount={discountedPrice} className="text-xl" />
            </div>
            {/* review */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center text-babyshopTextLight">
                <Star size={15} />
                <Star size={15} />
                <Star size={15} />
                <Star size={15} />
                <Star size={15} />
              </div>
              <p className="text-sm">({0} reviews)</p>
            </div>
          </div>
          {/* user view */}
          <p className="flex items-center gap-1 mt-2">
            <Eye />
            <span className="font-semibold">29</span>{" "}
            <span className="text-babyshopBlack/70">
              people are viewing this right now
            </span>
          </p>
          <div className="flex mt-3">
            <Button className="py-5 text-base  flex-1 bg-babyshopSky hover:bg-babyshopSky/90">
              Buy Now
            </Button>
          </div>
          <div className="flex items-center gap-5 justify-between border-b border-b-babyshopTextLight/50 pb-5 mt-3">
            <div className="flex items-center gap-2">
              <FileQuestion /> <p>Ask a Question</p>
            </div>
            <div className="flex items-center gap-2">
              <Share2 /> <p>Share</p>
            </div>
          </div>
        {/* Delivery part */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 ">
            <Truck size={30} />
            <div>
              <p className="font-medium">
                Estimated Delivery:{" "}
                <span className="text-sm text-babyshopBlack/70">
                  {" "}
                  05 - 10 March, 2026{" "}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 ">
            <Box size={30} />
            <div>
              <p className="font-medium">
                Free Shipping & Returns:{" "}
                <span className="text-sm text-babyshopBlack/70">
                  {" "}
                  On all orders over Rs 2000.00{" "}
                </span>
              </p>
            </div>
        </div>
          </div>
          <div className="flex  flex-col items-center justify-center p-5 bg-babyshopTextLight/10 mt-3 rounded-lg">
            <Image src={payment} alt="PaymentImage" className="w-72 sm:w-80 mb-2"/>
            <p className="text-sm text-center text-babyshopBlack/70">Guranted safe and secure checkout</p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SingleProductPage;
