"use client";

import { type PropertyImage } from "@/components/listings/property-cards/property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { StandardizedPropertyListing } from "@/hooks/api/adapters/property-adapter";
import { getPropertyAdapter } from "@/hooks/api/adapters/property-adapter-factory";
import { PropertyTypeToInterface } from "@/hooks/api/v1/types/property.types";
import { cn } from "@/lib/utils";
import { ListingType, PropertyType } from "@/types/property";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { HeartIcon, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Define a generic property type that covers both API formats
type GenericPropertyType = {
  id: string | number;
  title?: string;
  propertyType?: PropertyType;
  property_type?: PropertyType;
  listingType?: ListingType;
  listing_type?: "buy" | "rent";
  images?: Array<string | ImageType>;
  description?: string;
  location?: string;
  price?: number;
  formattedPrice?: string;
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
  area?: number;
  agent?: string;
  isFeatured?: boolean;
  isNew?: boolean;
};

// Define an image type that covers both formats
type ImageType = {
  id?: string;
  url?: string;
  image_url?: string;
  alt?: string;
};

interface VirtualizedVerticalListProps {
  /** Properties to display - can be StandardizedPropertyListing or API property types */
  properties: StandardizedPropertyListing[] | PropertyTypeToInterface<PropertyType>[];
  /** Optional class name */
  className?: string;
  /** Height of the container (in px or vh) */
  height?: string | number;
  /** Handle property card click */
  onPropertyClick?: (id: string) => void;
  /** Handle favorite toggle */
  onFavoriteToggle?: (id: string) => void;
  /** Handle share click */
  onShareClick?: (id: string) => void;
}

// Animation variants for cards and badges
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

const badgeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * A virtualized list for displaying vertical property cards
 * Optimized for performance with large lists
 */
export function VirtualizedVerticalList({
  properties,
  className,
  height = "100%",
  onPropertyClick,
  onFavoriteToggle,
  onShareClick,
}: VirtualizedVerticalListProps) {
  // Get property adapter for transformations if needed
  const propertyAdapter = getPropertyAdapter();

  // Convert properties to StandardizedPropertyListing if necessary
  const standardizedProperties = useMemo(() => {
    return properties.map((property: GenericPropertyType) => {
      // Check if property is already in standardized format
      if (
        "listingType" in property &&
        "propertyType" in property &&
        Array.isArray(property.images)
      ) {
        return property as StandardizedPropertyListing;
      }

      // Determine the correct listing type
      const listingType = property.listing_type || "buy";
      // Cast to the ListingType to ensure type safety
      const safeListingType = (listingType === "rent" ? "rent" : "buy") as ListingType;

      // Otherwise, transform using the adapter
      return propertyAdapter.transformV1Property(
        property,
        property.property_type || "condominium",
        {
          propertyType: property.property_type || "condominium",
          listingType: safeListingType,
        }
      );
    });
  }, [properties, propertyAdapter]);

  // Hold a list of favorites
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());

  // Reference to the container element
  const parentRef = useRef<HTMLDivElement>(null);

  // Setup virtualizer for rows - each row is a property card
  const rowVirtualizer = useVirtualizer({
    count: standardizedProperties.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Estimated height of vertical property card
    overscan: 3, // Number of items to render outside of the visible area
  });

  // Handle internal favorite toggle
  const handleFavoriteToggle = useCallback(
    (id: string) => {
      setFavoriteProperties((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });

      // Call external handler if provided
      onFavoriteToggle?.(id);
    },
    [onFavoriteToggle]
  );

  // Handle card click
  const handleCardClick = useCallback(
    (id: string) => {
      onPropertyClick?.(id);
    },
    [onPropertyClick]
  );

  // Handle share click
  const handleShareClick = useCallback(
    (id: string) => {
      onShareClick?.(id);
    },
    [onShareClick]
  );

  // Calculate the total height of all rows
  const totalHeight = rowVirtualizer.getTotalSize();

  // Apply custom CSS for carousel when component mounts
  useEffect(() => {
    // Add custom CSS for carousel interactions
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .carousel-interaction {
        pointer-events: auto !important;
      }
      .carousel-interaction * {
        pointer-events: auto !important;
      }
      .embla__button {
        z-index: 30 !important;
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div
        style={{
          height: `${totalHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const property = standardizedProperties[virtualRow.index];

          // Prepare images for the property
          const images: PropertyImage[] = (property.images || []).map(
            (image: string | ImageType, index: number) => ({
              id: typeof image === "string" ? `image-${index}` : image.id || `image-${index}`,
              url: typeof image === "string" ? image : image.url || "",
              alt: property.title || "Property image",
            })
          );

          return (
            <motion.div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full p-2"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              <motion.div
                className="flex flex-col md:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card cursor-pointer h-full"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={(e) => {
                  // Only handle clicks if not coming from carousel elements
                  if (!(e.target as HTMLElement).closest(".carousel-interaction")) {
                    handleCardClick(property.id.toString());
                  }
                }}
              >
                {/* Property Image Carousel */}
                <div
                  className="md:w-2/5 h-60 md:h-auto relative bg-muted carousel-interaction"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Carousel
                    className="w-full h-full carousel-interaction"
                    opts={{
                      loop: true,
                      dragFree: false,
                    }}
                    aria-label={`Photo gallery for ${property.title}`}
                  >
                    <CarouselContent className="h-full">
                      {images.length > 0 ? (
                        images.map((image, index) => (
                          <CarouselItem key={image.id} className="h-full carousel-interaction">
                            <div className="relative h-full w-full pointer-events-none">
                              <Image
                                src={
                                  image.url ||
                                  `https://via.placeholder.com/800x450/0066cc/ffffff?text=${property.propertyType}`
                                }
                                alt={image.alt || property.title || ""}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover object-center"
                                unoptimized={true}
                                priority={index === 0}
                              />
                              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                            </div>
                          </CarouselItem>
                        ))
                      ) : (
                        // Fallback if no images are available
                        <CarouselItem className="h-full carousel-interaction">
                          <div className="relative h-full w-full">
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <p className="text-2xl text-muted-foreground">
                                {property.propertyType}
                              </p>
                            </div>
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>

                    <CarouselPrevious
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 carousel-interaction"
                      aria-label="View previous photo"
                    />
                    <CarouselNext
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 carousel-interaction"
                      aria-label="View next photo"
                    />
                  </Carousel>

                  {/* Listing Type Badge */}
                  <motion.div
                    className="absolute top-3 left-3 z-10 pointer-events-none"
                    variants={badgeVariants}
                  >
                    <Badge
                      className={cn(
                        "font-medium",
                        property.listingType === "buy"
                          ? "bg-primary text-primary-foreground"
                          : "bg-purple-600 text-white"
                      )}
                    >
                      {property.listingType === "buy" ? "For Sale" : "For Rent"}
                    </Badge>
                  </motion.div>

                  {/* Property Type */}
                  <motion.div
                    className="absolute top-3 right-3 z-10 pointer-events-none"
                    variants={badgeVariants}
                  >
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                      {property.propertyType}
                    </Badge>
                  </motion.div>

                  {/* Featured & New Badges */}
                  <div className="absolute bottom-3 left-3 z-10 flex gap-2 pointer-events-none">
                    {property.isFeatured && (
                      <motion.div variants={badgeVariants}>
                        <Badge className="bg-amber-500 text-white">Featured</Badge>
                      </motion.div>
                    )}
                    {property.isNew && (
                      <motion.div variants={badgeVariants}>
                        <Badge className="bg-green-500 text-white">New</Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 z-10 flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm carousel-interaction"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(property.id.toString());
                      }}
                    >
                      <HeartIcon
                        className={cn(
                          "h-4 w-4",
                          favoriteProperties.has(property.id.toString())
                            ? "fill-red-500 text-red-500"
                            : "text-foreground"
                        )}
                      />
                      <span className="sr-only">Favorite</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm carousel-interaction"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareClick(property.id.toString());
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-5 md:w-3/5 flex flex-col">
                  <h4 className="text-lg font-medium mb-2">{property.title}</h4>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span className="line-clamp-1">{property.location}</span>
                  </div>

                  {property.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {property.description}
                    </p>
                  )}

                  <h3 className="text-2xl font-bold text-primary mb-4">
                    {property.formattedPrice
                      ? property.listingType === "rent"
                        ? `${property.formattedPrice}/month`
                        : property.formattedPrice
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "PHP",
                          maximumFractionDigits: 0,
                        }).format(property.price) +
                        (property.listingType === "rent" ? "/month" : "")}
                  </h3>

                  {/* Property Features */}
                  <div className="grid grid-cols-3 gap-3 text-sm mb-5 mt-auto">
                    <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
                      <span className="text-lg font-medium">
                        {property.propertyType === "warehouse"
                          ? "0"
                          : property.features?.bedrooms || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Beds</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
                      <span className="text-lg font-medium">
                        {property.propertyType === "warehouse"
                          ? "0"
                          : property.features?.bathrooms || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Baths</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
                      <span className="text-lg font-medium">
                        {property.features?.area
                          ? property.features.area.toLocaleString()
                          : (property.area || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">Sq Ft</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <span className="text-sm text-muted-foreground">
                      {property.agent || "Listd Realty"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
