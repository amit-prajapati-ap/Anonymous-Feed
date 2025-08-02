import {z} from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters long")
  .max(20, "Username must be at most 20 characters long")
  .regex(/^[a-zA-Z0-9_]{2,20}$/, "Username can only contain letters, numbers, and underscores")
  .trim();

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.email(),
  password: z.string().min(6, {error: "Password must be at least 6 characters long"}).trim(),
})