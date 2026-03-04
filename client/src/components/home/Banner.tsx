import { fetchData } from '@/lib/api'
import { Banners } from '@/types/type'
import React from 'react'

const Banner =async () => {
    let banners:Banners[]=[]
    try {
        const data=await fetchData<Banners[]>("/banners")
        banners=data
        console.log(banners);
    } catch (error) {
        console.log(error);
    }
    const imageOne=banners[0]
    const imageTwo=banners[1]
    if(banners.length===0){
        return null
    }
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 md:gap-0 gap-3'>
        <div className='md:col-span-3 relative group overflow-hidden rounded-md'>banner 1</div>
        <div>banner 2</div>
    </div>
  )
}

export default Banner