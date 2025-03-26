"use client";

import { PropertyCard } from "@/components/listings/property-cards";
import { type PropertyImage } from "@/components/listings/property-cards/property-card";
import { StandardizedPropertyListing } from "@/hooks/api/adapters/property-adapter";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef, useState } from "react";

interface VirtualizedPropertyGridProps {
  /** Properties to display */
  properties: StandardizedPropertyListing[];
  /** Optional class name */
  className?: string;
  /** Number of columns to display (responsive) */
  columnCount: number;
  /** Height of the container (in px or vh) */
  height?: string | number;
  /** Handle property card click */
  onPropertyClick?: (id: string) => void;
  /** Handle favorite toggle */
  onFavoriteToggle?: (id: string) => void;
  /** Handle share click */
  onShareClick?: (id: string) => void;
}

/**
 * A virtualized grid for displaying property listings
 * Uses TanStack Virtual for efficient rendering of large lists
 */
export function VirtualizedPropertyGrid({
  properties,
  className,
  columnCount = 1,
  height = "100%",
  onPropertyClick,
  onFavoriteToggle,
  onShareClick,
}: VirtualizedPropertyGridProps) {
  // Hold a list of favorites
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());

  // Reference to the container element
  const parentRef = useRef<HTMLDivElement>(null);

  // Track container dimensions for calculating item sizes
  const [_containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Get estimated height based on column count
  const estimateHeight = useCallback(() => {
    // Base card heights for different layouts
    const baseHeights = {
      1: 300, // Single column (vertical layout)
      2: 420, // Two columns (grid layout)
      3: 420, // Three columns (grid layout)
      4: 420, // Four columns (grid layout)
    };
    return baseHeights[columnCount as keyof typeof baseHeights] || 420;
  }, [columnCount]);

  // Calculate rows based on properties and column count
  const rowCount = Math.ceil(properties.length / columnCount);

  // Update container dimensions when window resizes
  useEffect(() => {
    if (!parentRef.current) return;

    const updateDimensions = () => {
      if (parentRef.current) {
        setContainerDimensions({
          width: parentRef.current.offsetWidth,
          height: parentRef.current.offsetHeight,
        });
      }
    };

    // Initial update
    updateDimensions();

    // Listen for resize events
    window.addEventListener("resize", updateDimensions);

    // Create ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  // Setup virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateHeight,
    overscan: 5, // Number of items to render outside of the visible area
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

  // Calculate the total height of all rows
  const totalHeight = rowVirtualizer.getTotalSize();

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
          const rowStartIndex = virtualRow.index * columnCount;
          const rowEndIndex = Math.min(rowStartIndex + columnCount, properties.length);
          const rowProperties = properties.slice(rowStartIndex, rowEndIndex);

          return (
            <div
              key={virtualRow.key}
              className={cn(
                "absolute top-0 left-0 w-full grid gap-4 p-2",
                columnCount === 1 ? "grid-cols-1" : null,
                columnCount === 2 ? "grid-cols-2" : null,
                columnCount === 3 ? "grid-cols-3" : null,
                columnCount === 4 ? "grid-cols-4" : null
              )}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowProperties.map((property) => {
                const images: PropertyImage[] = (property.images || []).map((image, index) => ({
                  id: typeof image === "string" ? `image-${index}` : image.id || `image-${index}`,
                  url: typeof image === "string" ? image : image.url || "",
                  alt: property.title || "Property image",
                }));

                return (
                  <div key={property.id} className={columnCount === 1 ? "space-y-4" : ""}>
                    <PropertyCard
                      id={property.id.toString()}
                      title={property.title || ""}
                      description={property.description || ""}
                      price={property.price}
                      formattedPrice={property.formattedPrice || ""}
                      shortFormattedPrice={property.shortFormattedPrice || ""}
                      formattedSize={property.formattedSize || ""}
                      listingType={property.listingType}
                      propertyType={property.propertyType}
                      location={property.location || ""}
                      agent={property.agent || "Listd Realty"}
                      features={{
                        bedrooms: property.features?.bedrooms || 0,
                        bathrooms: property.features?.bathrooms || 0,
                        area: property.features?.area || property.area || 0,
                      }}
                      images={
                        images.length
                          ? images
                          : [
                              {
                                id: "default",
                                url: `https://via.placeholder.com/800x450/0066cc/ffffff?text=${property.propertyType}`,
                                alt: property.title || "Property Image",
                              },
                            ]
                      }
                      isFavorited={favoriteProperties.has(property.id.toString())}
                      onClick={onPropertyClick}
                      onFavoriteClick={handleFavoriteToggle}
                      onShareClick={onShareClick}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
