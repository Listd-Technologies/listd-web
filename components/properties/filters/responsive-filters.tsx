"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import React, { useState } from "react";
import { PropertyFilters } from ".";

interface ResponsiveFiltersProps {
  /** Whether to use compact mode for filters */
  compact?: boolean;
  /** Optional class name for additional styling */
  className?: string;
}

/**
 * Responsive filter bar that changes layout based on screen size
 * - On mobile: horizontal scrollable list with expand button
 * - On tablet+: full width with filters wrapping
 */
export function ResponsiveFilters({ compact = false, className }: ResponsiveFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handler for horizontal scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };

  // Scroll buttons for mobile
  const scrollLeft = () => {
    const container = document.getElementById("filter-scroll-container");
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("filter-scroll-container");
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Mobile and tablet view (scrollable) */}
      <div
        className={cn(
          "w-full flex items-center gap-2 relative md:hidden",
          isExpanded ? "h-auto" : "h-12 overflow-hidden"
        )}
      >
        {/* Filter toggle button */}
        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
        </Button>

        {/* Scroll container */}
        <div
          id="filter-scroll-container"
          className="flex-1 overflow-x-auto scrollbar-thin"
          onScroll={handleScroll}
        >
          <div className={cn("flex gap-2 pb-2", isExpanded && "flex-wrap")}>
            <PropertyFilters compact={true} />
          </div>
        </div>

        {/* Scroll buttons (only show when not expanded) */}
        {!isExpanded && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-10 z-10 bg-background/80 opacity-80 hover:opacity-100",
                scrollPosition <= 10 && "hidden"
              )}
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 bg-background/80 opacity-80 hover:opacity-100"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Desktop view (wrapped) */}
      <div className="hidden md:block">
        <PropertyFilters compact={compact} />
      </div>
    </div>
  );
}
