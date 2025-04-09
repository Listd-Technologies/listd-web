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
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// import { PiEyeBold, PiEyeClosedBold } from "react-icons/pi";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";

// Define the schema for login form validation
const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoadingCredentials, setLoginLoadingCredentials] = useState(false);
  const [loginLoadingProvider, setLoginLoadingProvider] = useState(false);
  const [signInError, setSignInError] = useState("");

  // Define form with zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmitSignIn = async (data: LoginFormValues) => {
    if (!isLoaded) return;

    try {
      setSignInError("");
      setLoginLoadingCredentials(true);
      
      // Attempt to sign in with credentials
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        // Sign in successful
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        // Handle additional verification steps if needed
        console.log("Additional verification step:", result);
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      setSignInError(error.errors?.[0]?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoginLoadingCredentials(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!isLoaded) return;

    try {
      setLoginLoadingProvider(true);
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex w-full items-center justify-start">
      <div className="h-full max-h-[820px] w-full max-w-[620px] space-y-8 px-24">
        <div className="space-y-2">
          <h1 className="text-[40px] font-bold leading-[44px]">Welcome!</h1>
          <p className=" text-neutral-500">
            Don't have an account? <Link href="/signup" className="text-primary hover:underline underline-offset-2">Sign up</Link>
          </p>
        </div>

        {signInError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {signInError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitSignIn)} className="space-y-8">
            <div className="mb-8 space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter Email" 
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
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password" 
                          className="h-12 pr-10" 
                          autoComplete="current-password"
                          {...field} 
                        />
                      </FormControl>
                      {/* <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex cursor-pointer items-center justify-center"
                      >
                        {showPassword ? (
                          <PiEyeClosedBold className="h-4 w-4 text-primary" />
                        ) : (
                          <PiEyeBold className="h-4 w-4 text-primary" />
                        )}
                      </button> */}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-neutral-600 cursor-pointer">
                        Keep me logged in
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              /> */}
            </div>

            <div>
              <Button
                className="flex w-full justify-center text-base font-medium h-12"
                type="submit"
                size="lg"
                disabled={loginLoadingCredentials || !isLoaded}
              >
                {loginLoadingCredentials ? "Logging in..." : "Log In"}
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
                disabled={loginLoadingProvider || !isLoaded}
                type="button"
                onClick={signInWithGoogle}
              >
                {!loginLoadingProvider && (
                  <Image
                    src="/images/google-logo.png"
                    alt="Google Logo"
                    width={40}
                    height={40}
                    className="h-8 w-8"
                  />
                )}
                {loginLoadingProvider
                  ? "Signing in..."
                  : "Sign in with Google"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
