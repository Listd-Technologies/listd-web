import { cn } from "@/lib/utils";
import { type BaseComponentProps, type LoadingProps } from "@/types";
import React from "react";
import { MotionContainer } from "../motion-container";
import { Spinner } from "./spinner";

export interface LoadingOverlayProps extends BaseComponentProps, LoadingProps {
  /**
   * Children to render when not loading
   */
  children: React.ReactNode;

  /**
   * Whether to show a full overlay
   * @default false
   */
  fullOverlay?: boolean;

  /**
   * Whether to show a spinner
   * @default true
   */
  showSpinner?: boolean;

  /**
   * Custom loading content
   */
  loadingContent?: React.ReactNode;

  /**
   * Text for the loading spinner
   * @default "Loading content"
   */
  loadingText?: string;

  /**
   * Size of the spinner
   * @default 32
   */
  spinnerSize?: number;
}

/**
 * Loading overlay component for wrapping content that may be loading
 */
export function LoadingOverlay({
  className,
  children,
  isLoading = false,
  fullOverlay = false,
  showSpinner = true,
  loadingContent,
  loadingText = "Loading content",
  spinnerSize = 32,
  ...props
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Show children with reduced opacity when loading */}
      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading && "opacity-40 pointer-events-none select-none"
        )}
        aria-hidden={isLoading}
      >
        {children}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <MotionContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            fullOverlay && "bg-background/80 backdrop-blur-sm z-10"
          )}
        >
          {loadingContent
            ? loadingContent
            : showSpinner && <Spinner size={spinnerSize} label={loadingText} isLoading />}
        </MotionContainer>
      )}
    </div>
  );
}
