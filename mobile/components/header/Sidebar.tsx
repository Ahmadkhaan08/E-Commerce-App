import { View, Text } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react'

const Sidebar = () => {
  return (
    <View className='ml-1'>
      {/* <Text>Sidebar</Text>
       */}
       <Ionicons name="menu" size={32} color="black" />
    </View>
  )
}

export default Sidebar