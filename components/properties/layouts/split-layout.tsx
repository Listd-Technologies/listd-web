"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SplitLayoutProps {
  /** Content for the list section */
  listSection: React.ReactNode;
  /** Content for the map section */
  mapSection: React.ReactNode;
  /** Optional class name for additional styling */
  className?: string;
  /** Position of list (left) vs map (right) - defaults to list-left */
  orientation?: "list-left" | "list-right";
  /** Split ratio between list and map (out of 12 grid columns) */
  listWidth?: 4 | 5 | 6 | 7 | 8;
}

/**
 * Layout component for split view (map + list side by side)
 * Used on desktop screens
 */
export function SplitLayout({
  listSection,
  mapSection,
  className,
  orientation = "list-left",
  listWidth = 5,
}: SplitLayoutProps) {
  // Map list width to Tailwind width classes
  let listWidthClass = "w-5/12";
  let mapWidthClass = "w-7/12";

  switch (listWidth) {
    case 4:
      listWidthClass = "w-4/12";
      mapWidthClass = "w-8/12";
      break;
    case 5:
      listWidthClass = "w-5/12";
      mapWidthClass = "w-7/12";
      break;
    case 6:
      listWidthClass = "w-6/12";
      mapWidthClass = "w-6/12";
      break;
    case 7:
      listWidthClass = "w-7/12";
      mapWidthClass = "w-5/12";
      break;
    case 8:
      listWidthClass = "w-8/12";
      mapWidthClass = "w-4/12";
      break;
    default:
      listWidthClass = "w-5/12";
      mapWidthClass = "w-7/12";
  }

  return (
    <div className={cn("flex h-full w-full transition-all duration-300", className)}>
      {orientation === "list-left" ? (
        <>
          <div
            className={`${listWidthClass} h-full overflow-auto border-r border-border flex-shrink-0`}
          >
            {listSection}
          </div>
          <div className={`${mapWidthClass} h-full flex-grow min-w-0`}>{mapSection}</div>
        </>
      ) : (
        <>
          <div className={`${mapWidthClass} h-full flex-grow min-w-0`}>{mapSection}</div>
          <div
            className={`${listWidthClass} h-full overflow-auto border-l border-border flex-shrink-0`}
          >
            {listSection}
          </div>
        </>
      )}
    </div>
  );
}
