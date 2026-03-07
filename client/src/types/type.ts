export interface Category {
  _id: string;
  name: string;
  image: string;
  categoryType: "Featured" | "Hot Categories" | "Top Categories";
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
}

export interface Banners {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  discountPercentage: number;
  price: number;
  stock: number;
  averageRating: number;
  image: string;
  category: Category;
  brand: Brand;
}

export interface Address{
    _id:string;
    street:string;
    city:string;
    country:string;
    postalCode:string;
    isDefault:boolean;
}

export interface AddressInput{
    street:string;
    city:string;
    country:string;
    postalCode:string;
    isDefault?:boolean;
}