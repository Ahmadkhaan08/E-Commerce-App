export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "deliveryman";
  createdAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
  categoryType: "Featured" | "Hot Categories" | "Top Categories";
  createdAt: string;
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
  createdAt: string;
}

export interface Banner {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
  createdAt: string;
}

export interface StatsData{
  counts:{
    users:number;
    products:number;
    categories:number;
    brands:number;
    orders:number;
    totalRevenue:number;
  }
  roles:{name:string;value:number}[];
  categories:{name:string;value:number}[];
  brands:{name:string;value:number}[];

}
