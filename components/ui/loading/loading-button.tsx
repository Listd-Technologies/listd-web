import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type LoadingProps } from "@/types";
import { type VariantProps } from "class-variance-authority";
import React from "react";
import { Spinner } from "./spinner";

export interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants>,
    LoadingProps {
  /**
   * Whether to use asChild pattern
   */
  asChild?: boolean;

  /**
   * Loading text to display alongside spinner
   */
  loadingText?: string;

  /**
   * Whether to show the spinner on the left or right
   * @default "left"
   */
  spinnerPosition?: "left" | "right";

  /**
   * Size of the spinner
   * @default 16
   */
  spinnerSize?: number;
}

/**
 * Button with loading state
 */
export function LoadingButton({
  className,
  children,
  disabled,
  isLoading = false,
  loadingText,
  spinnerPosition = "left",
  spinnerSize = 16,
  ...props
}: LoadingButtonProps) {
  const content = (
    <>
      {isLoading && spinnerPosition === "left" && (
        <Spinner
          size={spinnerSize}
          className="mr-2"
          color="text-current"
          label={loadingText || "Loading"}
        />
      )}

      {isLoading && loadingText ? loadingText : children}

      {isLoading && spinnerPosition === "right" && (
        <Spinner
          size={spinnerSize}
          className="ml-2"
          color="text-current"
          label={loadingText || "Loading"}
        />
      )}
    </>
  );

  return (
    <Button
      className={cn(isLoading && "cursor-wait", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </Button>
  );
}
