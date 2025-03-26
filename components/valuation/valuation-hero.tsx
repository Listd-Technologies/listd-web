"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ValuationHero() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Use the resolved theme or fall back to a default during SSR
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to valuation form function
  const scrollToValuationForm = () => {
    document.getElementById("valuation-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className={`min-h-[calc(100vh-65px)] relative flex items-center ${
        isMounted && currentTheme === "dark" ? "bg-gray-900/50" : "bg-[#f5f0ff]"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Find Your Property's
              <motion.span
                className={`block ${isMounted && currentTheme === "dark" ? "text-purple-500" : "text-[#6B21A8]"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                True Market Value
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-lg mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Our advanced valuation tool uses real-time market data, comparable sales, and local
              trends to provide an accurate estimate of your property's worth.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                className={`${
                  isMounted && currentTheme === "dark"
                    ? "bg-[#9333EA] hover:bg-purple-600"
                    : "bg-[#6B21A8] hover:bg-purple-900"
                } text-white px-6 py-3 h-auto text-lg font-medium rounded-lg`}
                onClick={scrollToValuationForm}
              >
                Get Free Valuation
              </Button>
              <Button variant="outline" className="px-6 py-3 h-auto text-lg rounded-lg border-2">
                See How It Works
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by property owners across the Philippines
              </p>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">No Obligation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                    <svg
                      className="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Instant Results</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Main image with decorative elements */}
            <div
              className={`relative rounded-xl overflow-hidden aspect-[4/3] shadow-xl ${
                isMounted && currentTheme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Image
                src={`${isMounted && currentTheme === "dark" ? "/images/house-valuation-dark.png" : "/images/house-valuation-light.png"}`}
                alt="Property Valuation"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={(e) => {
                  // Show fallback icon if image fails to load
                  e.currentTarget.style.display = "none";
                  if (document.getElementById("valuation-image-fallback")) {
                    document.getElementById("valuation-image-fallback")!.style.display = "flex";
                  }
                }}
              />

              {/* Fallback icon if images don't exist */}
              <div
                id="valuation-image-fallback"
                className="absolute inset-0 items-center justify-center hidden"
              >
                <div
                  className={`${
                    isMounted && currentTheme === "dark" ? "bg-purple-900/20" : "bg-purple-100"
                  } p-6 rounded-full`}
                >
                  <TrendingUp
                    className={`h-16 w-16 ${
                      isMounted && currentTheme === "dark" ? "text-[#9333EA]" : "text-[#6B21A8]"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Floating stats card */}
            <motion.div
              className={`absolute -bottom-6 -left-6 ${
                isMounted && currentTheme === "dark" ? "bg-gray-800" : "bg-white"
              } p-4 rounded-lg shadow-lg border ${
                isMounted && currentTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`${
                    isMounted && currentTheme === "dark" ? "bg-[#9333EA]" : "bg-[#6B21A8]"
                  } rounded-full p-2`}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. property values in BGC</p>
                  <p className="text-lg font-bold">₱12.5M - ₱38.5M</p>
                </div>
              </div>
            </motion.div>

            {/* Floating accuracy card */}
            <motion.div
              className={`absolute -top-6 -right-6 ${
                isMounted && currentTheme === "dark" ? "bg-gray-800" : "bg-white"
              } p-4 rounded-lg shadow-lg border ${
                isMounted && currentTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`${
                    isMounted && currentTheme === "dark" ? "bg-green-600" : "bg-green-700"
                  } rounded-full p-2`}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Accuracy rating</p>
                  <p className="text-lg font-bold">95%+</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator animation */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">Scroll to get started</p>
          <svg
            className="w-6 h-6 text-[#6B21A8] dark:text-[#9333EA] animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
