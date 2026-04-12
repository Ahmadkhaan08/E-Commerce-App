import { View, Text } from 'react-native'
import React, { use, useEffect, useMemo, useState } from 'react'
import SingleProductSkeleton from '@/skeleton/SingleProductSkeleton'
import { Product } from '@/types/type'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
import { getBaseUrl } from '@/constants/api'
import { fetchProducts } from '@/constants/productApi'


interface ProductResponse {
  products: Product[];
  total: number;
}

const BabyTravelSection = () => {
  const [products,setProducts]=useState<Product[]>([])
  const [loading,setLoading] = useState(false)
  const[error,setError]=useState<string|null>(null)
  const apiBaseUrl=useMemo(()=>getBaseUrl(),[])
  useEffect(()=>{
    const loadProducts=async()=>{
      setLoading(true)
      setError(null)
      try {
        const data = await fetchProducts()
        setProducts(data)
        // console.log("data:",data)
      } catch (error) {
        setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch banners",
          );
      }finally{
        setLoading(false)
      }
    }
    loadProducts()
  },[apiBaseUrl])
  if (loading) {
    return <SingleProductSkeleton/>
  }

  return (
    <View>
      <Text>{products.map((product)=>(
        <Text key={product._id}>{product.name}</Text>
      ))}</Text>
    </View>
  )
}

export default BabyTravelSection