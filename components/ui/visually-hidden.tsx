import { cn } from "@/lib/utils";
import { type BaseProps } from "@/types";
import React, { ElementType } from "react";

/**
 * Props for the VisuallyHidden component
 */
export interface VisuallyHiddenProps extends BaseProps {
  /**
   * Whether the content should be hidden from all users, including screen readers
   * @default false
   */
  hidden?: boolean;

  /**
   * The HTML element to render
   * @default "span"
   */
  as?: ElementType;
}

/**
 * Hides content visually but keeps it accessible to screen readers
 * Use this component for elements that should be announced by screen readers
 * but not visible on the page
 */
export function VisuallyHidden({
  children,
  className,
  hidden = false,
  as: Component = "span",
  ...props
}: VisuallyHiddenProps) {
  // If hidden is true, hide from all users including screen readers
  if (hidden) {
    return null;
  }

  // Apply visually-hidden styles that keep content accessible to screen readers
  return (
    <Component
      className={cn(
        "absolute h-px w-px overflow-hidden whitespace-nowrap p-0",
        // Border ensures the element is effectively hidden
        "border-0",
        // Position offscreen
        "-m-px",
        // Clip visually but remain accessible
        "clip-rect-[0_0_0_0]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
