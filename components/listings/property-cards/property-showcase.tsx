"use client";

import { Button } from "@/components/ui/button";
import { EnhancedSkeleton } from "@/components/ui/enhanced-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePropertyListings } from "@/hooks/api/usePropertyListings";
import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { cn } from "@/lib/utils";
import { type BaseComponentProps } from "@/types";
import { ListingType, PropertyType } from "@/types/property";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { PropertyCard, type PropertyCardProps } from "./property-card";
import { allProperties, propertiesByListingType, propertiesByType } from "./sample-properties";

export interface PropertyShowcaseProps extends BaseComponentProps {
  /**
   * Whether to show all property types
   */
  showAllPropertyTypes?: boolean;

  /**
   * Custom property list to display
   */
  properties?: PropertyCardProps[];

  /**
   * Maximum number of properties to display per type
   */
  maxPerType?: number;
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Helper function to format listing type for display
function formatListingType(type: ListingType): string {
  return type === "buy" ? "For Sale" : "For Rent";
}

// Helper function to format property type for display
function formatPropertyType(type: PropertyType): string {
  switch (type) {
    case "condominium":
      return "Condominium";
    case "house-and-lot":
      return "House and Lot";
    case "warehouse":
      return "Warehouse";
    case "vacant-lot":
      return "Vacant Lot";
    default:
      return type;
  }
}

/**
 * Component that showcases property cards for different property types with filtering
 */
export function PropertyShowcase({
  className,
  showAllPropertyTypes = true,
  properties = allProperties,
  maxPerType = 3,
  ...props
}: PropertyShowcaseProps) {
  // Get the filters from Zustand store
  const { filters, updateFilters } = usePropertyFiltersStore();

  // State for favorites and loading state
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Local state to track if "All" property types filter is active
  const [isAllPropertyTypesSelected, setIsAllPropertyTypesSelected] = useState(true);

  // Available property types
  const propertyTypes: PropertyType[] = ["condominium", "house-and-lot", "vacant-lot", "warehouse"];

  // This is to simulate real API loading when switching filters
  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect is intentionally dependent only on filter changes to simulate API loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [filters.listingType, filters.propertyType, isAllPropertyTypesSelected]);

  // Filter properties based on selection
  const getFilteredProperties = () => {
    let filteredProps: PropertyCardProps[];

    if (isAllPropertyTypesSelected) {
      filteredProps = propertiesByListingType[filters.listingType];
    } else {
      filteredProps = propertiesByType[filters.propertyType].filter(
        (prop) => prop.listingType === filters.listingType
      );
    }

    return filteredProps.slice(0, maxPerType);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (id: string) => {
    setFavoriteProperties((prev) =>
      prev.includes(id) ? prev.filter((propId) => propId !== id) : [...prev, id]
    );
  };

  // Handle share click
  const handleShareClick = (id: string) => {
    alert(`Sharing property ${id}`);
  };

  // Handle card click
  const handleCardClick = (id: string) => {
    alert(`Viewing property ${id}`);
  };

  // Handle listing type change
  const handleListingTypeChange = (value: string) => {
    updateFilters({
      listingType: value as ListingType,
    });
  };

  // Handle property type change
  const handlePropertyTypeChange = (value: string) => {
    if (value === "all") {
      setIsAllPropertyTypesSelected(true);
      return;
    }

    setIsAllPropertyTypesSelected(false);
    updateFilters({
      propertyType: value as PropertyType,
    });
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Listing Type Tabs */}
        <Tabs
          value={filters.listingType}
          onValueChange={handleListingTypeChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rent">{formatListingType("rent")}</TabsTrigger>
            <TabsTrigger value="buy">{formatListingType("buy")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Property Type Filters */}
        <div className="flex flex-wrap gap-2">
          {showAllPropertyTypes && (
            <Button
              variant={isAllPropertyTypesSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handlePropertyTypeChange("all")}
            >
              All
            </Button>
          )}
          {propertyTypes.map((type) => (
            <Button
              key={type}
              variant={
                !isAllPropertyTypesSelected && filters.propertyType === type ? "default" : "outline"
              }
              size="sm"
              onClick={() => handlePropertyTypeChange(type)}
              className={
                !properties.some(
                  (p) => p.propertyType === type && p.listingType === filters.listingType
                )
                  ? "opacity-50"
                  : ""
              }
            >
              {formatPropertyType(type)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className={cn("grid gap-4 md:gap-6", "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
          {/* Display skeleton loaders while loading */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <EnhancedSkeleton height={200} className="w-full rounded-t-xl" />
              <div className="p-4 space-y-3">
                <EnhancedSkeleton height={24} width="70%" />
                <EnhancedSkeleton height={16} width="90%" />
                <EnhancedSkeleton height={24} width="40%" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <EnhancedSkeleton height={40} width="100%" />
                  <EnhancedSkeleton height={40} width="100%" />
                  <EnhancedSkeleton height={40} width="100%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Property Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {getFilteredProperties().map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                isFavorited={favoriteProperties.includes(property.id)}
                onFavoriteClick={handleFavoriteToggle}
                onShareClick={handleShareClick}
                onClick={handleCardClick}
              />
            ))}
          </motion.div>

          {getFilteredProperties().length === 0 && (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p className="text-muted-foreground">
                There are no{" "}
                {isAllPropertyTypesSelected ? "" : formatPropertyType(filters.propertyType)}{" "}
                properties currently available for {filters.listingType === "buy" ? "sale" : "rent"}
                .
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
