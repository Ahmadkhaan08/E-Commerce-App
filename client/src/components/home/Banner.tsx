import { fetchData } from '@/lib/api'
import { Banners } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
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
    <div className='grid grid-cols-1 md:grid-cols-4 md:gap-1 gap-3'>
        <div className='md:col-span-3 relative group overflow-hidden rounded-md'>
            <Image src={imageOne?.image} alt='BannerImage' width={800} height={500} priority className='w-full h-72 md:min-h-[400px] object-cover hoverEffect group-hover:scale-110'/>
            <div className='absolute top-0 left-0 h-full w-full flex flex-col gap-3 items-center justify-center '>
                <p className='font-bold text-sm'>{imageOne?.name}</p>
                <h2 className='text-4xl font-medium max-w-96 capitalize text-center'>{imageOne?.title}</h2>
                <Link href={"/shop"} className='capitalize bg-babyshopWhite rounded-full font-medium text-babyshopBlack hover:text-babyshopWhite px-6 py-2 text-base hover:bg-babyshopSky/10 border border-transparent hover:border hover:border-babyshopWhite hoverEffect'>shop now</Link>
            </div>
        </div>
        <div className=' relative group overflow-hidden rounded-md'>
            <Image src={imageTwo?.image} alt='BannerImage' width={800} height={500} priority className='w-full h-72 md:min-h-[400px] object-cover hoverEffect group-hover:scale-110'/>
            <div className='absolute top-10 left-0 h-full w-full flex flex-col gap-3 items-center justify-start '>
                <p className='font-bold text-sm'>{imageTwo?.name}</p>
                <h2 className='text-4xl font-medium max-w-96 capitalize text-center'>{imageTwo?.title}</h2>
                <Link href={"/shop"} className='capitalize bg-babyshopWhite rounded-full font-medium text-babyshopBlack hover:text-babyshopWhite px-6 py-2 text-base hover:bg-babyshopSky/10 border border-transparent hover:border hover:border-babyshopWhite hoverEffect'>shop now</Link>
            </div>
        </div>
    </div>
  )
}

export default Banner