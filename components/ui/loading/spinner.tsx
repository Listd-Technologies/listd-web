import { cn } from "@/lib/utils";
import { type BaseComponentProps, type LoadingProps } from "@/types";
import { Loader2 } from "lucide-react";
import React from "react";
import { MotionContainer } from "../motion-container";
import { VisuallyHidden } from "../visually-hidden";

export interface SpinnerProps extends BaseComponentProps, LoadingProps {
  /**
   * Size of the spinner in pixels
   * @default 24
   */
  size?: number;

  /**
   * The spinner text for screen readers
   * @default "Loading"
   */
  label?: string;

  /**
   * Whether to show the spinner only when loading
   * @default true
   */
  showOnlyWhenLoading?: boolean;

  /**
   * Color of the spinner
   * @default "text-primary"
   */
  color?: string;
}

/**
 * Spinner component for loading states
 */
export function Spinner({
  className,
  size = 24,
  label = "Loading",
  isLoading = true,
  showOnlyWhenLoading = true,
  color = "text-primary",
  ...props
}: SpinnerProps) {
  // If we're not loading and component should only show when loading
  if (!isLoading && showOnlyWhenLoading) return null;

  return (
    <MotionContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div className="relative inline-flex">
        <Loader2 className={cn("animate-spin", color)} size={size} aria-hidden="true" />
        <VisuallyHidden>{label}</VisuallyHidden>
      </div>
    </MotionContainer>
  );
}
