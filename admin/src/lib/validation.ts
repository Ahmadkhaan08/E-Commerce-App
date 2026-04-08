import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
  email: z.email({ message: "Please enter a valid email address!" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters!" }),
    
  role: z.enum(["admin", "user", "deliveryman"], "Please select a valid role"),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address!" }),
  password: z
    .string()
    .min(1, { message: "Password must be enter!" }),
    
});

export const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
  email: z.email({ message: "Please enter a valid email address!" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters!" }).optional(),
    
  role: z.enum(["admin", "user", "deliveryman"], "Please select a valid role"),
  avatar: z.string().optional(),
});

export const brandSchema=z.object({
  name:z.string().min(2,{message:"Name must be at least 2 characters!"}),
  image:z.string().optional()
})

export const categorySchema=z.object({
   name:z.string().min(2,{message:"Name must be at least 2 characters!"}),
  image:z.string().optional(),
  categoryType:z.enum(["Featured", "Hot Categories", "Top Categories"],"Category type is invalid!")
})

export const productSchema=z.object({
  name:z.string().min(2,{message:"Name must be at least 2 characters!"}),
  description:z.string().min(10,{message:"Description must be at least 10 characters!"}),
  price:z.number().min(0,{message:"Price should be positive number!"}),
  discountPercentage:z.number().min(0).max(100),
  stock:z.number().min(0),
  category:z.string().min(1,{message:"Please select a category!"}),
  brand:z.string().min(1,{message:"Please select a brand!"}),
  image:z.string().min(1,{message:"Please upload an image!"}),
})

export const bannerSchema=z.object({
  name:z.string().min(1,"Name is required!"),
  title:z.string().min(1,"Title is required!"),
  startFrom:z.number().min(0,"StartFrom must be a positive number! "),
  image:z.string().min(1,"Image is required!"),
  bannerType:z.string().min(1,"Type is required!")
})

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters!" }),
  avatar: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\+?[0-9\s()-]{7,20}$/.test(value),
      "Please enter a valid phone number!",
    ),
  bio: z
    .string()
    .max(220, { message: "Bio must be 220 characters or fewer!" })
    .optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required!" }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters!" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your new password!" }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match!",
  });
