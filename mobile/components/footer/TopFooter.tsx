import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { footerTopData } from '@/constants/data'

const TopFooter = () => {
  return (
    <ScrollView className='bg-gray-200 rounded-md mr-3 mb-2 gap-5 ml-3 py-5'>
        {footerTopData.map((item)=>{
            const Icon = item.image;
            return (
            <View key={item?.title} className='flex-row items-center gap-5 p-3 '>
            <Icon width={32} height={32} />
            <View>
                <Text className='text-lg font-medium capitalize mb-1.5'>{item.title}</Text>
                <Text className='font-medium text-babyshopBlack leading-5'>{item.subTitle}</Text>
            </View>
            </View>
              );
        })}
    </ScrollView>
  )
}

export default TopFooter