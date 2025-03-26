import { cn } from "@/lib/utils";
import { type BaseComponentProps } from "@/types";
import React from "react";
import { VisuallyHidden } from "./visually-hidden";

export interface SkeletonProps extends BaseComponentProps {
  /**
   * Height of the skeleton
   */
  height?: string | number;

  /**
   * Width of the skeleton
   */
  width?: string | number;

  /**
   * Shape of the skeleton
   * @default "rounded"
   */
  variant?: "rounded" | "circular" | "rectangular";

  /**
   * Label for screen readers
   * @default "Loading"
   */
  label?: string;

  /**
   * Whether to animate the skeleton
   * @default true
   */
  animate?: boolean;
}

/**
 * Enhanced skeleton component for loading states
 * Provides improved accessibility and customization options
 */
export function EnhancedSkeleton({
  className,
  height,
  width,
  variant = "rounded",
  label = "Loading",
  animate = true,
  ...props
}: SkeletonProps) {
  // Determine border radius based on variant
  const getBorderRadius = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-none";
      default:
        return "rounded-md";
    }
  };

  // Create style object for height and width
  const style: React.CSSProperties = {};

  if (height) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  if (width) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "overflow-hidden bg-muted",
        getBorderRadius(),
        animate && "animate-pulse",
        className
      )}
      style={style}
      {...props}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
    </div>
  );
}
