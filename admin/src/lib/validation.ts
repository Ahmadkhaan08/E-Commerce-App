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
