import React from 'react'
interface Props{
    price:number;
    discountPercentage?:number
}
const PriceContainer = ({price,discountPercentage}:Props) => {
  return (
    <div>PriceContainer</div>
  )
}

export default PriceContainer