"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ValuationSection() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Use the resolved theme or fall back to a default during SSR
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    // ${isMounted && currentTheme === "dark" ? "bg-gray-900/50" : "bg-[#f5f0ff]"}
    <AnimatedSection
      className={`py-8 md:py-10 `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col mb-20">
            {/* Image Container with background */}
            <div
              className={`relative rounded-lg h-[460px] md:h-[600px] ${
                isMounted && currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Image
                src={
                  isMounted && currentTheme === "dark"
                    ? "/valuate-your-home-dark.png"
                    : "/valuate-your-home.png"
                }
                alt="Valuate your home"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />

              {/* Card positioned below the image */}
              <div
              className={cn(
                "absolute flex items-center justify-center top-[calc(100%-3.25rem)] inset-x-0"
              )}
                // className={`relative mt-4 bg-background/95 dark:bg-gray-900/95 p-4 rounded-lg shadow-md border border-border ${
                //   isMounted && currentTheme === "dark" ? "border-gray-700" : "border-gray-200"
                // }`}
              >
                <div className="flex w-4/5 sm:w-2/4 gap-x-3 rounded-lg shadow p-4 z-[10] items-start bg-white">
                  <div
                    className={`${isMounted && currentTheme === "dark" ? "bg-[#a855f7]" : "bg-[#6b21a8]"} rounded-full p-2`}
                  >
                    <TrendingUp className="text-white h-5 w-5 sm:h-4 sm:w-4" />
                  </div>
                  <div>
                    <h2 className=" text-xl leading-8 font-bold">Valuate your home</h2>
                    <p className="text-sm text-muted-foreground">
                      Get an accurate estimate of your property's worth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:p-16 h-full flex items-center justify-center">
            <div className="space-y-8 sm:pb-20">
              <h1 className="text-[2rem] sm:text-[2.5rem] sm:leading-[120%] text-center sm:text-left leading-12 sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Find out your home's value, instantly
              </h1>
              <p className="text-muted-foreground sm:text-left text-center text-base pb-4">
                The simple, free, no-obligation way to request an accurate valuation of your home from
                estate and letting agents who are experts in your local area.
              </p>
              <Link href="/valuation">
                <Button
                  className={`${
                    isMounted && currentTheme === "dark"
                      ? "bg-[#a855f7] hover:bg-[#9333ea]"
                      : "bg-[#6b21a8] hover:bg-[#581c87]"
                  } text-white px-6 py-6 text-base  font-semibold rounded-md w-full sm:w-auto`}
                >
                  Start Valuation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
