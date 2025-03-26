"use client";

import { PropertyCard } from "@/components/listings/property-cards";
import { type ListingType, type PropertyType } from "@/components/providers/listing-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EnhancedSkeleton } from "@/components/ui/enhanced-skeleton";
import { type StandardizedPropertyListing } from "@/hooks/api/adapters/property-adapter";
import { getPropertyAdapter } from "@/hooks/api/adapters/property-adapter-factory";
import { type PropertyListingsFilter, usePropertyListings } from "@/hooks/api/usePropertyListings";
import { PropertyTypeToInterface } from "@/hooks/api/v1/types/property.types";
import { cn } from "@/lib/utils";
import { type BaseComponentProps } from "@/types";
import { motion } from "framer-motion";
import { HeartIcon, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { type PropertyImage } from "./property-cards/property-card";

export interface PropertyListingGridProps extends BaseComponentProps {
  /**
   * Filters to apply to the property listings
   */
  filters?: Partial<PropertyListingsFilter>;

  /**
   * Number of columns to display on mobile
   * @default 1
   */
  mobileColumns?: number;

  /**
   * Number of columns to display on tablet
   * @default 2
   */
  tabletColumns?: number;

  /**
   * Number of columns to display on desktop
   * @default 3
   */
  desktopColumns?: number;

  /**
   * Display style for the property listings
   * @default "grid" - Standard grid layout
   * @option "vertical" - Vertical list layout (Zillow-style)
   */
  displayStyle?: "grid" | "vertical";

  /**
   * Whether to use the property adapter instead of direct API calls
   * @default true
   */
  useAdapter?: boolean;

  /**
   * Optional pre-fetched properties to display
   * If provided, these will be used instead of making API calls
   */
  properties?: PropertyTypeToInterface<PropertyType>[];

  /**
   * Loading state flag
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: Error | null;
}

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

// Animation variants for the card
const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  hover: {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: {
      duration: 0.2,
    },
  },
};

// Animation for the badges
const badgeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

// Add a memo-wrapped version of the PropertyCard to prevent unnecessary re-renders
const MemoizedPropertyCard = React.memo(PropertyCard);

/**
 * A grid component that displays property listings with loading states
 */
export function PropertyListingGrid({
  className,
  filters = {},
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  displayStyle = "grid",
  properties = [],
  isLoading: isLoadingProp,
  error: errorProp,
  ...props
}: Omit<PropertyListingGridProps, "useSampleData" | "sampleProperties" | "useAdapter">) {
  // State for API data using the adapter
  const [apiData, setApiData] = useState<StandardizedPropertyListing[]>([]);
  const [isLoadingApiAdapter, setIsLoadingApiAdapter] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [favoriteProperties, setFavoriteProperties] = useState<string[]>([]);
  const propertyAdapter = useMemo(() => getPropertyAdapter(), []);

  // Reference usePropertyListings but don't directly use the result
  usePropertyListings(filters); // Keep the hook call for API integration

  // Use pre-fetched properties if provided, otherwise fetch using adapter
  const shouldUseAdapter = !properties || properties.length === 0;

  // Add effect to fetch data using the property adapter when properties aren't provided
  useEffect(() => {
    if (shouldUseAdapter) {
      setIsLoadingApiAdapter(true);
      setApiError(null);

      // Convert from PropertyListingsFilter to PropertyFilter format
      const adapterFilters = {
        propertyType: filters.propertyType as PropertyType,
        listingType: filters.listingType as "buy" | "rent",
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        minBedrooms: filters.minBedrooms,
        minBathrooms: filters.minBathrooms,
      };

      // Fetch properties using the adapter
      propertyAdapter
        .getPropertyListings(adapterFilters)
        .then((response) => {
          console.log("DATA FROM ADAPTER:", response.data);

          // Log any condominium properties for debugging
          const condoListings = response.data.filter(
            (listing) => listing.propertyType === "condominium"
          );
          if (condoListings.length > 0) {
            console.log("CONDOMINIUM LISTINGS FROM ADAPTER:", condoListings);
          }

          // Log warehouse properties for debugging
          const warehouseListings = response.data.filter(
            (listing) => listing.propertyType === "warehouse"
          );
          if (warehouseListings.length > 0) {
            console.log("WAREHOUSE LISTINGS FROM ADAPTER:", warehouseListings);
          }

          setApiData(response.data);
          setIsLoadingApiAdapter(false);
        })
        .catch((err) => {
          console.error("Error fetching properties using adapter:", err);
          setApiError(err);
          setIsLoadingApiAdapter(false);
        });
    } else if (properties.length > 0) {
      // If properties are provided, transform them using the adapter
      console.log("Using pre-fetched properties:", properties.length);

      // Convert properties to standardized format if needed
      const standardizedProperties = properties.map((property) => {
        // Check if property is already in standardized format by looking for Standard format-specific fields
        if (
          "listingType" in property &&
          "propertyType" in property &&
          Array.isArray(property.images)
        ) {
          return property as unknown as StandardizedPropertyListing;
        }

        // Otherwise, transform the v1 API property
        const propertyType = (filters.propertyType as PropertyType) || "condominium";
        return propertyAdapter.transformV1Property(property, propertyType, {
          propertyType,
          listingType: filters.listingType as ListingType,
        });
      });

      setApiData(standardizedProperties);
    }
  }, [filters, propertyAdapter, properties, shouldUseAdapter]);

  // Define the grid columns based on props
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  // Determine if we're loading and which data to use
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : isLoadingApiAdapter;
  const error = errorProp || apiError;

  // Decide which data to use - now we're just using API data
  const listings = apiData.length > 0 ? apiData : [];

  // Debug log to check listing types before filtering
  useEffect(() => {
    if (listings.length > 0) {
      console.log("🧐 Property listings before filtering:", {
        currentFilterListingType: filters.listingType,
        listingTypes: listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          listingType: listing.listingType,
          propertyType: listing.propertyType,
        })),
      });
    }
  }, [listings, filters.listingType]);

  // Add filter to ensure only properties matching the current listing type are displayed
  const filteredListings = listings.filter((listing) => {
    // Only apply listing type filter if it's specifically set
    if (filters.listingType) {
      return listing.listingType === filters.listingType;
    }
    return true;
  });

  // Handle loading state
  if (isLoading) {
    if (displayStyle === "vertical") {
      return (
        <div className={cn("space-y-6", className)} {...props}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row border rounded-lg overflow-hidden bg-card"
            >
              {/* Image skeleton - Fixed height on mobile, proper ratio on desktop */}
              <div className="w-full md:w-2/5 h-60 md:h-auto relative">
                <div className="aspect-[4/3] h-full w-full">
                  <EnhancedSkeleton className="w-full h-full absolute inset-0" />
                </div>
              </div>
              {/* Content skeleton */}
              <div className="w-full md:w-3/5 p-5 flex flex-col">
                {/* Price */}
                <EnhancedSkeleton height={32} width="50%" className="mb-4" />

                {/* Beds/Baths/Area */}
                <div className="flex gap-4 mb-4">
                  <EnhancedSkeleton height={20} width={60} />
                  <EnhancedSkeleton height={20} width={60} />
                  <EnhancedSkeleton height={20} width={60} />
                </div>

                {/* Title */}
                <EnhancedSkeleton height={24} width="80%" className="mb-2" />

                {/* Location */}
                <div className="flex items-center gap-2 mb-4">
                  <EnhancedSkeleton height={16} width={16} className="rounded-full" />
                  <EnhancedSkeleton height={16} width="60%" />
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mt-auto mb-4">
                  <EnhancedSkeleton height={50} />
                  <EnhancedSkeleton height={50} />
                  <EnhancedSkeleton height={50} />
                </div>

                {/* Listd Realty and buttons */}
                <div className="flex justify-between items-center mt-auto">
                  <EnhancedSkeleton height={20} width={80} />
                  <div className="flex gap-2">
                    <EnhancedSkeleton height={40} width={40} className="rounded-full" />
                    <EnhancedSkeleton height={40} width={40} className="rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "grid gap-4 md:gap-6",
          `${gridCols[mobileColumns as keyof typeof gridCols]} md:${
            gridCols[tabletColumns as keyof typeof gridCols]
          } lg:${gridCols[desktopColumns as keyof typeof gridCols]}`,
          className
        )}
        {...props}
      >
        {/* Display skeleton loaders while loading */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <EnhancedSkeleton height={200} className="w-full" />
            <EnhancedSkeleton height={24} width="70%" />
            <EnhancedSkeleton height={16} width="40%" />
            <EnhancedSkeleton height={16} width="60%" />
          </div>
        ))}
      </div>
    );
  }

  // Handle error state - simplified
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive mb-4">Error loading property listings: {error.message}</p>
        <p className="text-muted-foreground mb-4">
          Please try again later or contact support if the issue persists.
        </p>
      </div>
    );
  }

  // Handle empty state
  if (filteredListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-xl font-semibold mb-2">No properties found</p>
        <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  // Handle card click
  const handleCardClick = (id: string) => {
    console.log(`Clicked on property ${id}`);
    // Navigate to property detail page or open modal
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (id: string) => {
    console.log(`Toggled favorite for property ${id}`);

    // Update favorites state for sample data
    if (isLoadingApiAdapter) {
      setFavoriteProperties((prev) =>
        prev.includes(id) ? prev.filter((propId) => propId !== id) : [...prev, id]
      );
    }
    // For API data, would normally call an API to update favorite status
  };

  // Handle share click
  const handleShareClick = (id: string) => {
    console.log(`Sharing property ${id}`);
    // Open share dialog
  };

  // Display vertical listing layout (Zillow-style)
  if (displayStyle === "vertical") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("space-y-6", className)}
        {...props}
      >
        {/* When using adapter data - now this is our only option */}
        {apiData.map((listing) => {
          return (
            <motion.div
              key={listing.id}
              className="flex flex-col md:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card cursor-pointer"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => handleCardClick(listing.id.toString())}
            >
              {/* Property Image Carousel */}
              <div className="md:w-2/5 h-60 md:h-auto relative bg-muted">
                <Carousel
                  className="w-full h-full"
                  opts={{
                    loop: true,
                    dragFree: false,
                  }}
                  aria-label={`Photo gallery for ${listing.title}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CarouselContent className="h-full">
                    {listing.images && listing.images.length > 0 ? (
                      listing.images.map((image: PropertyImage, index) => (
                        <CarouselItem key={image.id} className="h-full">
                          <div className="relative h-full w-full">
                            <Image
                              src={
                                image.url ||
                                `https://via.placeholder.com/800x450/0066cc/ffffff?text=${listing.propertyType}`
                              }
                              alt={image.alt || listing.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover object-center"
                              unoptimized={true}
                              onError={(e) => {
                                if (!(e.target as HTMLImageElement).dataset.hasFallback) {
                                  console.error(`Failed to load image: ${image.url}`);
                                  (e.target as HTMLImageElement).dataset.hasFallback = "true";
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/800x450/0066cc/ffffff?text=${encodeURIComponent(listing.propertyType || "Property")}`;
                                }
                              }}
                              priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      // Fallback if no images are available
                      <CarouselItem className="h-full">
                        <div className="relative h-full w-full">
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <p className="text-2xl text-muted-foreground">{listing.propertyType}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="View previous photo"
                  />
                  <CarouselNext
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="View next photo"
                  />
                </Carousel>

                {/* Listing Type Badge */}
                <motion.div className="absolute top-3 left-3 z-10" variants={badgeVariants}>
                  <Badge
                    className={cn(
                      "font-medium",
                      listing.listingType === "buy"
                        ? "bg-primary text-primary-foreground"
                        : "bg-purple-600 text-white"
                    )}
                  >
                    {listing.listingType === "buy" ? "For Sale" : "For Rent"}
                  </Badge>
                </motion.div>

                {/* Property Type */}
                <motion.div className="absolute top-3 right-3 z-10" variants={badgeVariants}>
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    {listing.propertyType}
                  </Badge>
                </motion.div>

                {/* Featured & New Badges */}
                <div className="absolute bottom-3 left-3 z-10 flex gap-2">
                  {listing.isFeatured && (
                    <motion.div variants={badgeVariants}>
                      <Badge className="bg-amber-500 text-white">Featured</Badge>
                    </motion.div>
                  )}
                  {listing.isNew && (
                    <motion.div variants={badgeVariants}>
                      <Badge className="bg-green-500 text-white">New</Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 md:w-3/5 flex flex-col">
                <h4 className="text-lg font-medium mb-2">{listing.title}</h4>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>

                {listing.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {listing.description}
                  </p>
                )}

                <h3 className="text-2xl font-bold text-primary mb-4">
                  {listing.formattedPrice
                    ? listing.listingType === "rent"
                      ? `${listing.formattedPrice}/month`
                      : listing.formattedPrice
                    : new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "PHP",
                        maximumFractionDigits: 0,
                      }).format(listing.price) + (listing.listingType === "rent" ? "/month" : "")}
                </h3>

                {/* Property Features */}
                <div className="grid grid-cols-3 gap-3 text-sm mb-5 mt-auto">
                  <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
                    <span className="text-lg font-medium">
                      {listing.propertyType === "warehouse" ? "0" : listing.features.bedrooms}
                    </span>
                    <span className="text-xs text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
                    <span className="text-lg font-medium">
                      {listing.propertyType === "warehouse" ? "0" : listing.features.bathrooms}
                    </span>
                    <span className="text-xs text-muted-foreground">Baths</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
                    <span className="text-lg font-medium">
                      {listing.features.area ? listing.features.area.toLocaleString() : "0"}
                    </span>
                    <span className="text-xs text-muted-foreground">Sq Ft</span>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {listing.agent || "Listd Realty"}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(listing.id.toString());
                      }}
                    >
                      <HeartIcon
                        className={cn(
                          "h-5 w-5",
                          favoriteProperties.includes(listing.id.toString())
                            ? "fill-red-500 text-red-500"
                            : "text-foreground"
                        )}
                      />
                      <span className="sr-only">Favorite</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareClick(listing.id.toString());
                      }}
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  // Display horizontal listing layout (standard grid)
  if (displayStyle === "grid") {
    return (
      <div
        className={cn(
          "grid gap-4 md:gap-6",
          `${gridCols[mobileColumns as keyof typeof gridCols]} md:${
            gridCols[tabletColumns as keyof typeof gridCols]
          } lg:${gridCols[desktopColumns as keyof typeof gridCols]}`,
          className
        )}
        {...props}
      >
        {filteredListings.map((listing) => {
          return (
            <MemoizedPropertyCard
              key={listing.id}
              id={listing.id.toString()}
              title={listing.title || ""}
              description={listing.description || ""}
              price={listing.price}
              formattedPrice={listing.formattedPrice || ""}
              shortFormattedPrice={listing.shortFormattedPrice || ""}
              formattedSize={listing.formattedSize || ""}
              listingType={listing.listingType}
              propertyType={listing.propertyType}
              location={listing.location || ""}
              agent={listing.agent || "Listd Realty"}
              features={{
                bedrooms: listing.features?.bedrooms || 0,
                bathrooms: listing.features?.bathrooms || 0,
                area: listing.features?.area || listing.area || 0,
              }}
              images={
                listing.images || [
                  {
                    id: `${listing.id}-default`,
                    url: "https://via.placeholder.com/800x450/0066cc/ffffff?text=Property",
                    alt: listing.title || "Property Image",
                  },
                ]
              }
              onClick={handleCardClick}
              onFavoriteClick={handleFavoriteToggle}
              onShareClick={handleShareClick}
            />
          );
        })}
      </div>
    );
  }
}
