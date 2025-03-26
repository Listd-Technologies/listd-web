"use client";

import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/api/v1";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { PropertyType } from "@/types/property";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { PropertyCardSkeleton } from "./grid-skeleton";
import { PropertyCard, type PropertyImage } from "./property-card";
import { ResponsiveGrid } from "./responsive-grid";
import { VirtualizedPropertyGrid } from "./virtualized-grid";
import { VirtualizedVerticalList } from "./virtualized-vertical-list";

export { ResponsiveGrid } from "./responsive-grid";
export { PropertyCardSkeleton } from "./grid-skeleton";
export { PropertyCard } from "./property-card";
export { VirtualizedPropertyGrid } from "./virtualized-grid";
export { VirtualizedVerticalList } from "./virtualized-vertical-list";

// Basic interface for API property data
// This will be enhanced in Phase 3 with proper typing
interface PropertyData {
  id: string | number;
  title?: string;
  description?: string;
  price?: number;
  formatted_price?: string;
  listing_type?: "buy" | "rent";
  property_type?: PropertyType;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  // Different API versions use different structures for images
  media?: Array<{
    id?: string;
    url?: string;
    alt?: string;
  }>;
  images?: Array<string | { id?: string; url?: string; image_url?: string; isPrimary?: boolean }>;
}

/**
 * Grid of property cards fetched from the API
 * Includes infinite scrolling to load more properties when needed
 */
export function PropertyGrid({ className }: { className?: string }) {
  const router = useRouter();
  const { filters } = usePropertyFilters();
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());

  // Reference to the grid container for scroll detection
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Create query parameters for the API
  const queryParams = {
    listingType: filters.listingType,
    minPrice: filters.minPrice && filters.minPrice > 0 ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice && filters.maxPrice > 0 ? filters.maxPrice : undefined,
    minArea: filters.minArea && filters.minArea > 0 ? filters.minArea : undefined,
    maxArea: filters.maxArea && filters.maxArea > 0 ? filters.maxArea : undefined,
    minBedrooms: filters.minBedrooms && filters.minBedrooms > 0 ? filters.minBedrooms : undefined,
    minBathrooms:
      filters.minBathrooms && filters.minBathrooms > 0 ? filters.minBathrooms : undefined,
  };

  // Fetch properties using the v1 API with infinite query
  const {
    data: propertiesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProperties(queryParams, {
    propertyType: filters.propertyType,
    limit: 6, // Reduced number for better initial load performance
    enabled: true,
  });

  // Handle favoriting a property
  const handleFavoriteProperty = useCallback((id: string) => {
    setFavoriteProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Handle sharing a property
  const handleShareProperty = useCallback((id: string) => {
    // In a real implementation, this would open a share dialog
    alert(`Share property ${id}`);
  }, []);

  // Handle clicking a property card
  const handlePropertyClick = useCallback(
    (id: string) => {
      router.push(`/properties/showcase/${id}`);
    },
    [router]
  );

  // Load more properties when the "Load More" button is clicked
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Setup intersection observer for auto-loading on scroll
  useEffect(() => {
    // Create an observer for the sentinel element
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    // Get sentinel element
    const sentinel = document.getElementById("load-more-sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, handleLoadMore]);

  // Helper function to extract images from property data
  const extractPropertyImages = (propertyData: PropertyData): PropertyImage[] => {
    // Default image if none found
    const defaultImage: PropertyImage = {
      id: "placeholder",
      url: "https://placehold.co/600x400/png?text=No+Image",
      alt: `No image available for ${propertyData.title || "property"}`,
    };

    // Case 1: Media array is present (newer API format)
    if (propertyData.media && propertyData.media.length > 0) {
      return propertyData.media.map((image, index) => ({
        id: image.id || `image-${index}`,
        url: image.url || "",
        alt: image.alt || `Image of ${propertyData.title || "property"}`,
      }));
    }

    // Case 2: Images array is present (older API format)
    if (propertyData.images && propertyData.images.length > 0) {
      return propertyData.images.map((image, index) => {
        // Handle string URLs
        if (typeof image === "string") {
          return {
            id: `image-${index}`,
            url: image,
            alt: `Image of ${propertyData.title || "property"}`,
          };
        }
        // Handle object format
        return {
          id: image.id || `image-${index}`,
          url: image.url || image.image_url || "",
          alt: `Image of ${propertyData.title || "property"}`,
        };
      });
    }

    // Default: Return placeholder image
    return [defaultImage];
  };

  // If loading initial data, show skeleton
  if (isLoading) {
    return (
      <ResponsiveGrid className={className}>
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </ResponsiveGrid>
    );
  }

  // Get all properties from all pages
  const allProperties = propertiesData?.pages.flatMap((page) => page.data?.results || []) || [];

  // If no properties found
  if (allProperties.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No properties found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to find more properties.</p>
      </div>
    );
  }

  // Map API property data to PropertyCard props
  return (
    <div className="w-full space-y-6" ref={gridContainerRef}>
      <ResponsiveGrid className={className}>
        {allProperties.map((property) => {
          // Cast to our simplified PropertyData interface
          // TODO: In Phase 3, we'll create proper type definitions for the API responses
          const propertyData = property as PropertyData;

          // Extract and adapt images from the API response
          const images = extractPropertyImages(propertyData);

          return (
            <PropertyCard
              key={propertyData.id}
              id={propertyData.id.toString()}
              title={propertyData.title || "Unnamed Property"}
              description={propertyData.description}
              price={propertyData.price || 0}
              formattedPrice={propertyData.formatted_price}
              listingType={propertyData.listing_type || "buy"}
              propertyType={propertyData.property_type || filters.propertyType}
              location={propertyData.location || "Unknown Location"}
              features={{
                bedrooms: propertyData.bedrooms,
                bathrooms: propertyData.bathrooms,
                area: propertyData.area,
              }}
              images={images}
              isFavorited={favoriteProperties.has(propertyData.id.toString())}
              onFavoriteClick={handleFavoriteProperty}
              onShareClick={handleShareProperty}
              onClick={handlePropertyClick}
            />
          );
        })}
      </ResponsiveGrid>

      {/* Load More UI */}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            className="w-full max-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
          {/* Invisible sentinel element for intersection observer */}
          <div id="load-more-sentinel" className="h-4" />
        </div>
      )}

      {/* Show total count if we have all properties loaded */}
      {!hasNextPage && allProperties.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing all {allProperties.length} properties
        </p>
      )}
    </div>
  );
}
