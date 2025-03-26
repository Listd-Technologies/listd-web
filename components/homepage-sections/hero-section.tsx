"use client";

import {
  DISABLED_PROPERTY_TYPES,
  PropertyType,
  getPropertyListingsFilter,
  useListingContext,
} from "@/components/providers/listing-provider";
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
import { type PropertyListingsFilter } from "@/hooks/api/usePropertyListings";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { AnimatePresence, motion } from "framer-motion";
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
  const initializationRef = useRef(false);
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { state, dispatch } = useListingContext();
  const { updateFilters } = usePropertyFilters();

  // Use the resolved theme or fall back to a default during SSR
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  // Set initial component state after mount
  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
  }, []);

  // Initialize URL parameters with default values from the listing provider
  useEffect(() => {
    // Only run if the component is mounted and URL has no parameters
    if (isMounted && !window.location.search && !initializationRef.current) {
      console.log("Initializing URL params with defaults from listing context");

      // Get the current filters from the listing context
      const defaultFilters = getPropertyListingsFilter(state);

      // Update the URL with these default values - only once at initialization
      updateFilters(defaultFilters);
      initializationRef.current = true;
    }
  }, [isMounted, state, updateFilters]);

  // Function to handle tab change
  const handleTabChange = (tabId: "rent" | "buy") => {
    dispatch({ type: "SET_LISTING_TYPE", payload: tabId });
    // Also update the filters
    updateFilters({ listingType: tabId });
  };

  // Function to handle property type change
  const handlePropertyTypeChange = (value: string) => {
    // Skip if property type is disabled
    if (DISABLED_PROPERTY_TYPES.includes(value as PropertyType)) {
      console.warn(`Attempted to select disabled property type: ${value}`);
      return;
    }

    dispatch({ type: "SET_PROPERTY_TYPE", payload: value as PropertyType });
    // Also update the filters
    updateFilters({ propertyType: value as PropertyType });
  };

  // Function to handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const location = e.target.value;
    dispatch({ type: "SET_LOCATION", payload: location });
    // Also update the filters
    updateFilters({ location });
  };

  // Function to handle browse properties button click
  const handleBrowseProperties = async () => {
    // Create filter object from current state with proper type assertions
    const filterUpdates = {
      listingType: state.currentListingType as "buy" | "rent",
      propertyType: state.currentPropertyType as PropertyType,
      location: state.location,
    };

    // Safety check: if a disabled property type is selected, redirect to condominium
    if (DISABLED_PROPERTY_TYPES.includes(filterUpdates.propertyType)) {
      console.warn(
        `Attempted to browse with disabled property type: ${filterUpdates.propertyType}. Redirecting to condominium.`
      );
      filterUpdates.propertyType = "condominium";
    }

    try {
      // Update filters and wait for URL update to complete
      await updateFilters(filterUpdates);

      // Get the current URL search parameters after the update
      const currentSearch = window.location.search;

      // Navigate to properties page WITH the updated search parameters
      router.push(`/properties${currentSearch}`);
    } catch (error) {
      console.error("Failed to update filters:", error);
      // Navigate anyway as fallback
      router.push("/properties");
    }
  };

  return (
    <AnimatedSection className="relative bg-background min-h-[100vh] py-16 md:py-24 flex flex-col justify-center overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Buy, rent, or sell your property easily
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-foreground/80 mb-8 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A great platform to buy, sell, or even rent your properties without any commisions.
          </motion.p>

          <motion.div
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
          </motion.div>

          <motion.div
            className="max-w-4xl bg-background/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Tabs */}
            <div className="flex relative border-b">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  onClick={() => handleTabChange(tab.id as "rent" | "buy")}
                  className={`relative py-5 px-12 font-medium text-lg transition-colors ${
                    tab.id === state.currentListingType
                      ? `text-foreground dark:text-foreground font-semibold`
                      : "text-muted-foreground hover:text-foreground/70 dark:hover:text-foreground/70"
                  }`}
                  whileHover={{
                    scale: tab.id === state.currentListingType ? 1 : 1.02,
                  }}
                >
                  {tab.label}
                </motion.button>
              ))}

              {/* Show static indicator before component mounts, dynamic indicator after */}
              {!isMounted && state.currentListingType === "rent" && (
                <div
                  className="absolute bottom-0 h-[3px] bg-primary"
                  style={{
                    width: "79px",
                    left: 0,
                  }}
                />
              )}

              <AnimatePresence initial={true}>
                {isMounted && tabRefs.current[state.currentListingType] && (
                  <motion.div
                    className="absolute bottom-0 h-[3px] bg-primary"
                    layoutId="activeTabIndicator"
                    initial={{ opacity: 1, width: 0 }}
                    animate={{
                      opacity: 1,
                      width: tabRefs.current[state.currentListingType]?.offsetWidth || 0,
                      left: tabRefs.current[state.currentListingType]?.offsetLeft || 0,
                    }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-4">
                  <label
                    htmlFor="location-input"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <Input
                      id="location-input"
                      type="text"
                      placeholder="Search for location"
                      className="w-full bg-background dark:bg-gray-800/50 border border-border text-base focus:ring-2 focus:ring-primary/30 focus:border-primary h-12 pl-4"
                      value={state.location || ""}
                      onChange={handleLocationChange}
                    />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label
                    htmlFor="property-select"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Property
                  </label>
                  <div className="relative">
                    <Select
                      value={state.currentPropertyType}
                      onValueChange={handlePropertyTypeChange}
                    >
                      <SelectTrigger
                        id="property-select"
                        className="w-full border border-border bg-background dark:bg-gray-800/50 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-normal h-12 py-6"
                        aria-label="Property type"
                      >
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border rounded-lg">
                        {propertyTypes.map((type) => {
                          const isDisabled = DISABLED_PROPERTY_TYPES.includes(type as PropertyType);
                          const propertyLabel =
                            type === "condominium"
                              ? "Condominium"
                              : type === "house-and-lot"
                                ? "House and lot"
                                : type === "vacant-lot"
                                  ? "Vacant lot"
                                  : "Warehouse";

                          return (
                            <SelectItem
                              key={type}
                              value={type}
                              disabled={isDisabled}
                              className={`cursor-pointer ${isDisabled ? "opacity-50" : ""}`}
                            >
                              <span className="flex-1 text-left">{propertyLabel}</span>
                              {isDisabled && (
                                <span className="text-xs text-muted-foreground font-normal whitespace-nowrap">
                                  (Coming soon)
                                </span>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="md:col-span-4">
                  <Button
                    variant="default"
                    className={`${
                      isMounted && currentTheme === "dark"
                        ? "bg-[#a855f7] hover:bg-[#9333ea]"
                        : "bg-[#6b21a8] hover:bg-[#581c87]"
                    } text-white h-12 text-base px-6 py-3 font-medium w-full rounded-md transition-colors duration-200`}
                    onClick={handleBrowseProperties}
                  >
                    Browse Properties
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background image */}
      <div className="absolute top-0 right-0 w-full xl:w-1/2 h-full z-0">
        <div className="relative w-full h-full">
          <Image
            src={
              !isMounted || currentTheme === "dark"
                ? "/header-map-bg-dark.webp"
                : "/header-map-bg-light.webp"
            }
            alt="Map background"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-15 xl:opacity-100"
          />
        </div>
      </div>
    </AnimatedSection>
  );
}
