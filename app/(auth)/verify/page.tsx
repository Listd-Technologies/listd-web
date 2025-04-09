"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function VerifyPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [resendingCode, setResendingCode] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;

    try {
      setVerifying(true);
      setVerificationError("");
      
      // Attempt verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (completeSignUp.status === "complete") {
        // Sign up is complete, set the session
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirect to the home page
        router.push("/");
      } else {
        console.log("Verification incomplete", completeSignUp);
        setVerificationError("Verification code is incorrect or expired. Please try again.");
      }
    } catch (error: any) {
      console.error("Error verifying email:", error);
      setVerificationError(error.errors?.[0]?.message || "Failed to verify email. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    try {
      setResendingCode(true);
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerificationError("");
      // Success message
      alert("Verification code has been resent to your email.");
    } catch (error) {
      console.error("Error resending code:", error);
      setVerificationError("Failed to resend verification code. Please try again.");
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
          <p className="text-neutral-500 text-sm">
            We've sent a verification code to your email address.
            Please enter it below to verify your account.
          </p>
        </div>

        {verificationError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {verificationError}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="h-12 text-center tracking-widest text-lg"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12"
            disabled={verifying || !verificationCode}
          >
            {verifying ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="text-center space-y-4 pt-4">
          <p className="text-sm text-neutral-500">
            Didn't receive the code?{" "}
            <button 
              onClick={handleResendCode} 
              disabled={resendingCode}
              className="text-primary hover:underline underline-offset-2 disabled:opacity-50"
            >
              {resendingCode ? "Resending..." : "Resend code"}
            </button>
          </p>
          
          <p className="text-sm text-neutral-500">
            <Link href="/login" className="text-primary hover:underline underline-offset-2">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 