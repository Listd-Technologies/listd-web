"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { type ListingType, type PropertyType } from "@/types/property";
import { HeartIcon, MapPin, Share2 } from "lucide-react";
import React, { useCallback, useMemo, memo } from "react";

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
}

export interface PropertyCardProps {
  /** Property ID */
  id: string;
  /** Property title */
  title: string;
  /** Property description */
  description?: string;
  /** Property price */
  price: number;
  /** Formatted property price (if available from API) */
  formattedPrice?: string;
  /** Property listing type (rent, buy) */
  listingType: ListingType;
  /** Display listing type for UI (For Rent, For Sale) */
  displayListingType?: string;
  /** Property type */
  propertyType: PropertyType;
  /** Property location */
  location: string;
  /** Property features */
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
  /** Property images */
  images: PropertyImage[];
  /** Whether the property is favorited */
  isFavorited?: boolean;
  /** On favorite click handler */
  onFavoriteClick?: (id: string) => void;
  /** On share click handler */
  onShareClick?: (id: string) => void;
  /** On card click handler */
  onClick?: (id: string) => void;
  /** Optional class name for custom styling */
  className?: string;
}

/**
 * Property card component with image carousel
 * A simplified version for our refactored properties components
 */
export const PropertyCard = memo(function PropertyCard({
  id,
  title,
  description,
  price,
  formattedPrice,
  listingType,
  displayListingType,
  propertyType, // Used for type validation, will be used in Phase 3 for type-specific rendering
  location,
  features,
  images,
  isFavorited = false,
  onFavoriteClick,
  onShareClick,
  onClick,
  className,
}: PropertyCardProps) {
  // Helper to determine if we should show monthly price
  const showMonthly = useCallback(() => listingType === "rent", [listingType]);

  // Format price display
  const displayPrice = useMemo(() => {
    // If we have a formatted price from the API, use it
    if (formattedPrice) {
      return showMonthly() ? `${formattedPrice}/month` : formattedPrice;
    } else {
      // Otherwise format it ourselves
      const calculatedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP", // Use PHP for Philippine Peso
        maximumFractionDigits: 0,
      }).format(price);

      return showMonthly() ? `${calculatedPrice}/month` : calculatedPrice;
    }
  }, [formattedPrice, price, showMonthly]);

  // Helper function to get display listing type
  const getDisplayListingType = useCallback(() => {
    // If displayListingType is provided, use it
    if (displayListingType) return displayListingType;

    // Otherwise, use listing type
    return listingType === "buy" ? "For Sale" : "For Rent";
  }, [displayListingType, listingType]);

  // Handler to stop propagation from carousel events
  const handleCarouselInteraction = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  }, []);

  // Handle card click
  const handleCardClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  // Favorite button click handler with stop propagation
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFavoriteClick?.(id);
    },
    [id, onFavoriteClick]
  );

  // Share button click handler with stop propagation
  const handleShareClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onShareClick?.(id);
    },
    [id, onShareClick]
  );

  // Memoize card classes for performance
  const cardClasses = useMemo(
    () =>
      cn(
        "bg-card relative rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all",
        className
      ),
    [className]
  );

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-property-type={propertyType}
    >
      {/* Property Images Carousel */}
      <div className="relative" onClick={handleCarouselInteraction}>
        <Carousel
          className="w-full"
          opts={{
            loop: true,
            dragFree: false,
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem
                key={image.id}
                onClick={handleCarouselInteraction}
                className="cursor-grab active:cursor-grabbing"
              >
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={image.alt || `Property image ${index + 1}`}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-20" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-20" />
        </Carousel>

        {/* Listing Type Badge */}
        <Badge className="absolute top-3 left-3 z-10" variant="secondary">
          {getDisplayListingType()}
        </Badge>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleFavoriteClick}
          >
            <HeartIcon
              className={cn(
                "h-4 w-4",
                isFavorited ? "fill-red-500 text-red-500" : "text-foreground"
              )}
            />
            <span className="sr-only">Favorite</span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleShareClick}
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>

        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        )}

        <p className="text-xl font-bold text-primary mb-3">{displayPrice}</p>

        {/* Property Features */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          {features.bedrooms !== undefined && (
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <span className="font-medium">{features.bedrooms}</span>
              <span className="text-xs text-muted-foreground">Beds</span>
            </div>
          )}

          {features.bathrooms !== undefined && (
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <span className="font-medium">{features.bathrooms}</span>
              <span className="text-xs text-muted-foreground">Baths</span>
            </div>
          )}

          {features.area !== undefined && (
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <span className="font-medium">{features.area}</span>
              <span className="text-xs text-muted-foreground">Sq M</span>
            </div>
          )}
        </div>

        {/* Agent */}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Listd Realty</span>
        </div>
      </div>
    </div>
  );
});
