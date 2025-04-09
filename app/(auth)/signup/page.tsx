"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";

// Define the schema for sign up form validation
const signUpFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

const SignUpPage = () => {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");

  // Define form with zod validation
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    },
  });

  const onSubmitSignUp = async (data: SignUpFormValues) => {
    if (!isLoaded) return;

    try {
      setSignUpError("");
      setSignUpLoading(true);
      
      // Start the sign up process
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        password: data.password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ 
        strategy: "email_code" 
      });

      // Redirect to verification page
      router.push("/verify");
    } catch (error: any) {
      console.error("Error signing up:", error);
      setSignUpError(error.errors?.[0]?.message || "Failed to sign up. Please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    if (!isLoaded) return;

    try {
      setProviderLoading(true);
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      });
    } catch (error) {
      console.error("Error signing up with Google:", error);
    }
  };

  return (
    <div className="flex w-full items-center justify-start">
      <div className="h-full max-h-[820px] w-full max-w-[620px] space-y-8 px-24">
        <div className="space-y-2">
          <h1 className="text-[40px] font-bold leading-[44px]">Create an account</h1>
          <p className="text-neutral-500">
            Already have an account? <Link href="/login" className="text-primary hover:underline underline-offset-2">Log in</Link>
          </p>
        </div>

        {signUpError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {signUpError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitSignUp)} className="space-y-8">
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="youremail@example.com" 
                        className="h-12" 
                        autoComplete="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Create a password" 
                        className="h-12"
                        autoComplete="new-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      8+ characters with uppercase, lowercase and a number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Confirm your password" 
                        className="h-12"
                        autoComplete="new-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-neutral-600 text-sm cursor-pointer">
                        I agree to the <Link href="/terms" className="text-primary hover:underline underline-offset-2">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline underline-offset-2">Privacy Policy</Link>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Button
                className="flex w-full justify-center text-base font-medium h-12"
                type="submit"
                size="lg"
                disabled={signUpLoading || !isLoaded}
              >
                {signUpLoading ? "Creating account..." : "Create account"}
              </Button>

              <div className="relative my-6 flex h-4 items-center">
                <div className="h-px w-full bg-neutral-100/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="bg-white px-2.5 text-xs text-neutral-400">OR</p>
                </div>
              </div>

              <Button
                className="flex w-full justify-center text-base font-medium h-12"
                size="lg"
                variant="outline"
                disabled={providerLoading || !isLoaded}
                type="button"
                onClick={signUpWithGoogle}
              >
                {!providerLoading && (
                  <Image
                    src="/images/google_logo.png"
                    alt="Google Logo"
                    width={20}
                    height={20}
                    className="h-5 w-5 mr-2"
                  />
                )}
                {providerLoading
                  ? "Signing up..."
                  : "Sign up with Google"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpPage;
