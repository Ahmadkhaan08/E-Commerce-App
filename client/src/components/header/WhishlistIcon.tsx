import { Heart, HeartCrack } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const WhishlistIcon = () => {
  return (
     <Link
      href={"/user/whishlist"}
      className="relative hover:text-babyshopSky hoverEffect"
    >
      <Heart size={24} />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full items-center justify-center flex">
        0
      </span>
    </Link>
  )
}

export default WhishlistIcon