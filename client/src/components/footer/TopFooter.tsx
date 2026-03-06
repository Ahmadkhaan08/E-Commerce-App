import React from "react";
import Container from "../common/Container";
import { footerTopData } from "@/constants/data";
import Image from "next/image";

const TopFooter = () => {
  return (
    <Container className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 py-5 gap-5 ml-4 bg-gray-200 rounded-lg mr-4 mb-2">
      {footerTopData.map((item) => (
        <div
          key={item?.title}
          className="flex items-center gap-5 lg:border-r lg:border-black "
        >
          <Image src={item?.image} alt="TopFooterImage" />
          <div>
            <h3 className="text-lg font-semibold capitalize mb-1.5">
              {item?.title}
            </h3>
            <p className="font-medium text-babyshopBlack/60 leading-5">
              {item?.subTitle}
            </p>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default TopFooter;
