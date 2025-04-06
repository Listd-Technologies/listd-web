"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { cn } from "@/lib/utils";
import { DISABLED_PROPERTY_TYPES, PropertyType } from "@/types/property";
import { AnimatePresence, motion } from "framer-motion";
import { ChartScatter, MapPin, Search, Sparkle, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Available property types
const propertyTypes = ["condominium", "house-and-lot", "vacant-lot", "warehouse"];

// Tab options
const tabs = [
  { id: "rent", label: "Rent" },
  { id: "buy", label: "Buy" },
];

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();

  // Use Zustand store instead of context
  const filters = usePropertyFiltersStore((state) => state.filters);
  const updateFilters = usePropertyFiltersStore((state) => state.updateFilters);

  // Debug effect - log when filters change
  useEffect(() => {
    console.log("🔍 HeroSection component - Current filters:", filters);
  }, [filters]);

  // Use the resolved theme or fall back to a default during SSR
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  // Set initial component state after mount
  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
  }, []);

  // Function to handle tab change
  const handleTabChange = (tabId: "rent" | "buy") => {
    updateFilters({ listingType: tabId });
  };

  // Function to handle property type change
  const handlePropertyTypeChange = (value: string) => {
    // Skip if property type is disabled
    if (DISABLED_PROPERTY_TYPES.includes(value as PropertyType)) {
      console.warn(`Attempted to select disabled property type: ${value}`);
      return;
    }

    // Log before update
    console.log(`🔄 HeroSection - Updating property type from ${filters.propertyType} to ${value}`);

    // Update the store with the new property type
    updateFilters({ propertyType: value as PropertyType });
  };

  // Function to handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const location = e.target.value;
    updateFilters({ location });
  };

  // Function to handle browse properties button click
  const handleBrowseProperties = () => {
    // Get the current URL search parameters
    const currentSearch = window.location.search;

    // Navigate to properties page WITH the search parameters
    router.push(`/properties${currentSearch}`);
  };

  return (
    //  removed justify-center py-16
    <AnimatedSection className=" flex items-center md:items-start h-fit bg-[linear-gradient(to_bottom,white_0%,rgba(200,192,207,0.25)_80%,white_100%)] md:min-h-[100vh] py-10 md:py-0 overflow-hidden">
      {/* changed px-4 to px-0 , removed md:px-6 lg:px-8  z-10*/}
      <div className="container  md:h-[calc(100vh-4rem)]  flex-1 flex items-center justify-center md:items-start md:justify-end mx-auto px-0 ">
        <div className="w-full  md:max-w-[24rem] lg:max-w-[32rem] xl:max-w-[40rem] 2xl:max-w-[48rem] px-4 md:pt-16 md:pl-12 md:pr-20 space-y-8 md:space-y-12">
          {/* mobile hero section */}
          {/* <div className=" w-full px-4 space-y-8 "> */}
            <motion.h1
            // removed md:text-5xl lg:text-6xl
              className="text-[2.5rem]  leading-[3rem] text-center md:text-left md:text-[4rem] md:leading-[110%]  font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Buy, rent, or sell your property easily
            </motion.h1>
            <motion.p
            // removed md:text-lg md:text-xl md:max-w-xl leading-relaxed
              className="text-xl text-center md:text-left   md:text-xl text-foreground/80  "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              A great platform to buy, sell, or even rent your properties without any commisions.
            </motion.p>

            <div className="flex flex-col md:flex-col-reverse gap-y-8 md:gap-y-10 w-full">
              <motion.div
                // removed max-w-4xl md:bg-background/95 md:dark:bg-gray-900/95
                className="relative w-full px-4 md:px-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex relative border-b border-gray-100 ">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[tab.id] = el;
                      }}
                      onClick={() => handleTabChange(tab.id as "rent" | "buy")}
                      className={`relative flex-1 md:flex-none py-5 px-8 cursor-pointer font-medium text-lg transition-colors ${
                        tab.id === filters.listingType
                          ? `dark:text-foreground text-primary`
                          : "text-muted-foreground hover:text-foreground/70 dark:hover:text-foreground/70"
                      }`}
                      whileHover={{
                        scale: tab.id === filters.listingType ? 1 : 1.02,
                      }}
                    >
                      {tab.label}
                    </motion.button>
                  ))}

                  {/* Show static indicator before component mounts, dynamic indicator after */}
                  {!isMounted && filters.listingType === "rent" && (
                    <div
                      className="absolute bottom-0 h-[3px] bg-primary"
                      style={{
                        width: "79px",
                        left: 0,
                      }}
                    />
                  )}

                  <AnimatePresence initial={true}>
                    {isMounted && tabRefs.current[filters.listingType] && (
                      <motion.div
                        className="absolute bottom-0 h-[3px] bg-primary"
                        layoutId="activeTabIndicator"
                        initial={{ opacity: 1, width: 0 }}
                        animate={{
                          opacity: 1,
                          width: tabRefs.current[filters.listingType]?.offsetWidth || 0,
                          left: tabRefs.current[filters.listingType]?.offsetLeft || 0,
                        }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="mx-0 md:mx-0 md:absolute top-full left-0 md:min-w-[50vw] z-1 bg-white w-full shadow-b-xs rounded-b-lg md:rounded-b-md p-4 md:p-6 font-medium text-neutral-500 text-base text-left ">
                  <button  className="lg:hidden w-full flex items-center justify-between">
                    Search Location
                    <div className="p-3 rounded-lg bg-primary">
                      <Search className="h-5 w-5 text-white"/>
                    </div>
                  </button>

                  <div className="hidden lg:flex w-full items-center gap-x-4 justify-between">
                    <div className="flex w-full flex-1 items-center gap-x-6">
                      <div className="space-y-px pr-6 min-w-[30%]">
                        <p className="text-base text-muted-foreground">Location</p>
                        <p className="font-bold text-lg text-foreground">Manila, Philippines</p>
                      </div>

                      <div className="space-y-px pr-6 pl-8 border-l border-gray-200 min-w-[30%]">
                        <p className="text-base text-muted-foreground">Property</p>
                        <p className="font-bold text-lg text-foreground">Condominium</p>
                      </div>
                    </div>

                    <div className="pl-8 border-l border-gray-200">
                      <Button className={
                        cn(
                          "bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base leading-[150%]",
                          isMounted && currentTheme === "dark"
                          ? "bg-[#a855f7] hover:bg-[#9333ea]"
                          : "bg-[#6b21a8] hover:bg-[#581c87]"
                        )
                      }>Browse Properties</Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div className="flex w-full md:w-fit gap-x-6 mx-4 md:mx-0 md:gap-x-20">
                <div className="flex-1 flex items-center gap-x-6">
                  <div className="h-[85%] w-[3px] bg-gray-200"></div>
                  <div className="space-y-1">
                    <p className="text-[2rem] leading-[125%] font-bold text-primary">50k+</p>
                    <p className="text-gray-700">Renters</p>
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-x-6">
                  <div className="h-[85%] w-[3px] bg-gray-200"></div>
                  <div className="space-y-1">
                    <p className="text-[2rem] leading-[125%] font-bold text-primary">10k+</p>
                    <p className="text-gray-700">Properties</p>
                  </div>
                </div>
              </motion.div>
            </div>
          {/* </div> */}

          {/* <motion.div
            className="flex gap-8 mb-12 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center">
              <span className="text-primary font-medium mr-2 text-xl md:text-2xl">50K+</span>
              <span className="text-foreground/70 text-sm md:text-base">Renters</span>
            </div>
            <div className="flex items-center">
              <span className="text-primary font-medium mr-2 text-xl md:text-2xl">10K+</span>
              <span className="text-foreground/70 text-sm md:text-base">Properties</span>
            </div>
          </motion.div> */}

          
        </div>
      </div>

      {/* Background image */}
      <div className="hidden relative md:block flex-1  w-full h-[calc(100vh-4rem)] z-0">
        <div className="w-full h-full">
          <Image
            src={
              !isMounted || currentTheme === "dark"
                ? "/header-map-bg-dark.webp"
                : "/header-map-bg-light.webp"
            }
            alt="Map background"
            
            priority
            width={2000}
            height={2000}
            // sizes="1000"
            className="object-cover opacity-50 h-full w-full"
          />
        </div>

        <div className="absolute top-[7%] left-8 z-1  rounded-lg shadow-xs">
          <div className="w-[360px] relative h-[230px] rounded-t-lg bg-gray-300 ">
            {/* tag */}
            <div className="absolute bottom-0 -left-1.5 z-2 flex items-center gap-x-2 bg-[#a855f7] rounded-t-lg rounded-br-lg py-2 px-3 text-white text-xs font-bold">
              <ChartScatter className="size-4"/>
              <p>FEATURED</p>
              <div className="absolute top-full left-0 w-0 h-0 border-b-0 border-l-0 border-r-[8px] border-t-[8px] border-t-[#6b21a8] border-r-transparent rotate-90"></div>
            </div>
            {/* end of tag */}
            
          </div>
          <div className="w-full rounded-b-lg bg-white p-4 space-y-3">
            <p className="text-primary font-bold text-xl flex items-center gap-x-1.5 leading-[1.5rem]">
              ₱12,000{" "}
              <span className="text-sm leading-[1.5rem] text-muted-foreground font-normal">/ month</span>
            </p>
            <div>
              <p className="text-sm font-medium text-foreground">SMDC Grace Residences</p>
              <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
                <MapPin className="size-4 text-[#a855f7]"/>
                Club Laiya, Brgy, San Juan, Batangas
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[7%] right-8 z-1  rounded-lg shadow-xs">
          <div className="w-[360px] relative h-[230px] rounded-t-lg bg-gray-300 ">
            {/* tag */}
            <div className="absolute bottom-0 -left-1.5 z-2 flex items-center gap-x-2 bg-[#a855f7] rounded-t-lg rounded-br-lg py-2 px-3 text-white text-xs font-bold">
              <Sparkles className="size-4"/>
              <p>POPULAR</p>
              <div className="absolute top-full left-0 w-0 h-0 border-b-0 border-l-0 border-r-[8px] border-t-[8px] border-t-[#6b21a8] border-r-transparent rotate-90"></div>
            </div>
            {/* end of tag */}
            
          </div>
          <div className="w-full rounded-b-lg bg-white p-4 space-y-3">
            <p className="text-primary font-bold text-xl flex items-center gap-x-1.5 leading-[1.5rem]">
              ₱12,000{" "}
              <span className="text-sm leading-[1.5rem] text-muted-foreground font-normal">/ month</span>
            </p>
            <div>
              <p className="text-sm font-medium text-foreground">SMDC Grace Residences</p>
              <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
                <MapPin className="size-4 text-[#a855f7]"/>
                Club Laiya, Brgy, San Juan, Batangas
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
