export interface User  {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "deliveryman";
  createdAt:string
};

export interface Brand{
  _id:string;
  name:string;
  image?:string;
  createdAt:string;
}

export interface Category{
  _id:string;
  name:string;
  image?:string;
  categoryType:"Featured" | "Hot Categories" | "Top Categories";
  createdAt:string
}