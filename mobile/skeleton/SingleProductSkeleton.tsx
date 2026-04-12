import { View, Text } from 'react-native'
import React from 'react'

const SingleProductSkeleton = () => {
  return (
    <View className="py-12 bg-babyshopWhite p-3 rounded-md mt-3">
          <View className="flex-row items-center justify-between mb-8">
            <View className="space-y-2 ">
              <View className="h-8 w-64 bg-gray-200 rounded-md" />
              <View className="h-4 w-80 bg-gray-200 rounded-md mt-2" />
            </View>
          </View>
          <View className="flex  gap-4">
            {[...Array(8)].map((_, index) => (
              <View key={index} className="w-[100%] space-y-4 mb-4">
                <View className="h-48 w-full bg-gray-200 rounded-lg " />
                <View className="h-4 w-3/4 bg-gray-200 rounded-md mt-2" />
                <View className="h-4 w-1/2 bg-gray-200 rounded-md mt-2" />
                <View className="h-8 w-1/4 bg-gray-200 rounded-md mt-2" />
              </View>
            ))}
          </View>
        </View>
  )
}

export default SingleProductSkeleton