import React from "react";
import PriceFormatter from "./PriceFormatter";
interface Props {
  price: number;
  discountPercentage: number;
}
const PriceContainer = ({ price, discountPercentage }: Props) => {
  const discountPrice=price*(1-discountPercentage/100)
  return (
    <div className="flex items-center gap-2 text-sm">
    <PriceFormatter
      amount={price}
      className="text-babyshopTextLight line-through font-medium"
      />
    <PriceFormatter amount={discountPrice}/>
      </div>
  );
};

export default PriceContainer;
