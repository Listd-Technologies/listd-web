"use client";

import { cn } from "@/lib/utils";
import React, { memo, useMemo } from "react";

interface ResponsiveGridProps {
  /** Grid children */
  children: React.ReactNode;
  /** Optional class name for custom styling */
  className?: string;
  /** Custom number of columns for mobile */
  mobileColumns?: number;
  /** Custom number of columns for tablet */
  tabletColumns?: number;
  /** Custom number of columns for desktop */
  desktopColumns?: number;
  /** Custom number of columns for large desktop */
  largeDesktopColumns?: number;
}

/**
 * A responsive grid component with default column settings
 * Uses Tailwind's responsive breakpoints for a clean implementation
 */
export const ResponsiveGrid = memo(function ResponsiveGrid({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 2,
  largeDesktopColumns = 3,
}: ResponsiveGridProps) {
  // Memoize class name to avoid recreating it on every render
  const gridClassName = useMemo(() => {
    // Create column class based on props
    const columnClasses = [
      `grid-cols-${mobileColumns}`,
      `md:grid-cols-${tabletColumns}`,
      `lg:grid-cols-${desktopColumns}`,
      `xl:grid-cols-${largeDesktopColumns}`,
    ].join(" ");

    return cn("grid", columnClasses, "gap-4 w-full", className);
  }, [className, mobileColumns, tabletColumns, desktopColumns, largeDesktopColumns]);

  return <div className={gridClassName}>{children}</div>;
});
