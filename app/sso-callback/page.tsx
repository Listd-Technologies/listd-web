"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthenticateWithRedirectCallback 
        signInFallbackRedirectUrl="/update-profile"
        signUpFallbackRedirectUrl="/"
      />
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Finishing authentication...</h2>
        <div className="animate-pulse text-gray-500">
          Please wait, you'll be redirected shortly
        </div>
      </div>
    </div>
  );
} 