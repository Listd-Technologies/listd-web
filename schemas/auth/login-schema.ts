import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email().min(1, {
    message: "Email is Required!.",
  }),
  password: z.string().min(1, {
    message: "Password is Required",
  }),
  rememberMe: z.boolean(),
});

export type LoginForm = z.infer<typeof loginFormSchema>;
