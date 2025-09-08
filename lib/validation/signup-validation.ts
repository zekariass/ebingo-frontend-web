import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  nickName: z.string().min(1, { message: "Nickname is required" }),
  phone: z.string().regex(/^\+?\d{10,15}$/, { message: "Invalid phone number" }),
});

export type SignupFormData = z.infer<typeof signupSchema>;
