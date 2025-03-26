"use client";

import { AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import Image from "next/image";
import { useState } from "react";
import { type PropertyCardProps } from "../listings/property-cards/property-card";
import { Button } from "../ui/button";

interface PropertyMarkerProps {
  property: PropertyCardProps;
  position: { lat: number; lng: number };
  onMarkerClick?: (propertyId: string) => void;
  selected?: boolean;
  onInfoClose?: () => void;
}

export function PropertyMarker({
  property,
  position,
  onMarkerClick,
  selected = false,
  onInfoClose,
}: PropertyMarkerProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(selected);

  const handleMarkerClick = () => {
    setIsInfoOpen(true);
    if (onMarkerClick) {
      onMarkerClick(property.id);
    }
  };

  const handleInfoClose = () => {
    setIsInfoOpen(false);
    if (onInfoClose) {
      onInfoClose();
    }
  };

  return (
    <AdvancedMarker position={position} onClick={handleMarkerClick}>
      <div
        className={`rounded-full p-2 flex items-center justify-center text-white text-xs font-bold ${
          property.listingType === "buy" ? "bg-primary" : "bg-purple-600"
        }`}
      >
        {new Intl.NumberFormat("en-US", {
          notation: "compact",
          compactDisplay: "short",
          maximumFractionDigits: 0,
        }).format(property.price)}
      </div>

      {/* Show info window when selected or explicitly opened */}
      {(selected || isInfoOpen) && (
        <InfoWindow
          position={position}
          onCloseClick={handleInfoClose}
          pixelOffset={[0, -5]}
          maxWidth={300}
        >
          <div className="p-0 overflow-hidden" style={{ minWidth: "240px" }}>
            {/* Property Image */}
            <div className="relative w-full h-[120px] bg-muted">
              {property.images && property.images.length > 0 ? (
                <Image
                  src={property.images[0].url}
                  alt={property.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 300px) 100vw, 300px"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    if (!imgElement.dataset.hasFallback) {
                      imgElement.dataset.hasFallback = "true";
                      imgElement.src = `https://via.placeholder.com/600x400/0066cc/ffffff?text=${encodeURIComponent(
                        property.propertyType || "Property"
                      )}`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/80">
                  <p className="text-muted-foreground">{property.propertyType}</p>
                </div>
              )}

              {/* Listing Badge */}
              <div className="absolute top-2 left-2">
                <span
                  className={`text-xs font-medium py-1 px-2 rounded-sm ${
                    property.listingType === "buy"
                      ? "bg-primary text-white"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  {property.listingType === "buy" ? "For Sale" : "For Rent"}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-3 bg-background">
              {/* Price */}
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "PHP",
                  maximumFractionDigits: 0,
                }).format(property.price)}
                {property.listingType === "rent" ? "/month" : ""}
              </p>

              {/* Title */}
              <h3 className="font-medium text-sm mb-1 line-clamp-1">{property.title}</h3>

              {/* Location */}
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 mr-1"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{property.location}</span>
              </div>

              {/* Features */}
              <div className="flex justify-between items-center text-xs mb-3 mt-3">
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{property.features.bedrooms}</span>
                  <span className="text-muted-foreground">Beds</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{property.features.bathrooms}</span>
                  <span className="text-muted-foreground">Baths</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{property.features.area}</span>
                  <span className="text-muted-foreground">Sq Ft</span>
                </div>
              </div>

              {/* Button */}
              <Button
                className="w-full text-xs h-8 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMarkerClick) onMarkerClick(property.id);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
}
