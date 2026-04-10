import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';

const topHelpCenter = [
  { title: "Help Center", href: "/help" },
  { title: "Wishlist", href: "/user/wishlist" },
  { title: "Order Tracking", href: "/user/orders" },
  { title: "Shop Now", href: "/shop" },
];
const TopHeader = () => {
  return (
    <View className='w-full p-2  bg-babyshopPurple flex flex-row justify-between'>
        <View className='flex flex-row items-center gap-3 text-babyShopLightWhite'>{
            topHelpCenter.map((item)=>(
                <Link key={item.title} href={"/profile"} className='text-babyShopLightWhite text-sm font-medium'>{item.title}</Link>
            ))}
        </View>
        <View className='p-1 mr-2'>
            <Text>PKR</Text>
        </View>
    </View>
  )
}

export default TopHeader