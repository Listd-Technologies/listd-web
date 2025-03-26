"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
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
    <AnimatedSection
      className={`py-16 md:py-20 ${isMounted && currentTheme === "dark" ? "bg-gray-900/50" : "bg-[#f5f0ff]"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col">
            {/* Image Container with background */}
            <div
              className={`relative rounded-lg overflow-hidden h-[300px] md:h-[400px] ${
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
            </div>

            {/* Card positioned below the image */}
            <div
              className={`relative mt-4 bg-background/95 dark:bg-gray-900/95 p-4 rounded-lg shadow-md border border-border ${
                isMounted && currentTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`${isMounted && currentTheme === "dark" ? "bg-[#a855f7]" : "bg-[#6b21a8]"} rounded-full p-2 mr-3`}
                >
                  <TrendingUp className="text-white h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Valuate your home</h2>
                  <p className="text-xs text-muted-foreground">
                    Get an accurate estimate of your property's worth
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Find out your home's value, instantly
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              The simple, free, no-obligation way to request an accurate valuation of your home from
              estate and letting agents who are experts in your local area.
            </p>
            <Link href="/valuation">
              <Button
                className={`${
                  isMounted && currentTheme === "dark"
                    ? "bg-[#a855f7] hover:bg-[#9333ea]"
                    : "bg-[#6b21a8] hover:bg-[#581c87]"
                } text-white px-6 py-3 md:px-8 md:py-6 h-auto text-base md:text-lg font-medium rounded-md w-full sm:w-auto`}
              >
                Start Valuation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
