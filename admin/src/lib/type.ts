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

export type RawOrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "completed"
  | "cancelled";

export type OrderPaymentStatus = "paid" | "pending" | "failed";

export interface OrderCustomer {
  _id: string;
  name: string;
  email: string;
}

export interface OrderProduct {
  _id: string;
  name: string;
  image?: string;
  price: number;
}

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
  price: number;
}

export interface OrderShippingAddress {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  postalCode?: string;
  country: string;
}

export interface AdminOrder {
  _id: string;
  orderId: string;
  userId: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  status: RawOrderStatus;
  paymentStatus: OrderPaymentStatus;
  shippingAddress: OrderShippingAddress;
  paymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}
