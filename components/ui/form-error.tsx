import { cn } from "@/lib/utils";
import { validateProps } from "@/lib/utils/validation-utils";
import { type FormErrorSchemaType, formErrorSchema } from "@/schemas";
import { type BaseComponentProps } from "@/types";
import { AlertCircle } from "lucide-react";
import React from "react";
import { MotionContainer } from "./motion-container";

export interface FormErrorProps extends BaseComponentProps {
  /**
   * Error message to display
   */
  message?: string;

  /**
   * Associated form control ID for better accessibility
   */
  controlId?: string;

  /**
   * Whether to show the error icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Whether to animate the error message
   * @default true
   */
  animate?: boolean;
}

/**
 * Form error message component with proper styling and accessibility
 */
export function FormError({
  className,
  message,
  controlId,
  showIcon = true,
  animate = true,
  ...props
}: FormErrorProps) {
  // Validate props with Zod schema
  const validatedProps = validateProps(
    {
      className,
      message,
      controlId,
      showIcon,
      animate,
    },
    formErrorSchema,
    { componentName: "FormError" }
  );

  // Don't render anything if there's no message
  if (!validatedProps.message) return null;

  const content = (
    <div
      role="alert"
      id={validatedProps.controlId ? `${validatedProps.controlId}-error` : undefined}
      className={cn("flex items-center gap-1.5 text-sm text-destructive", validatedProps.className)}
      {...props}
    >
      {validatedProps.showIcon && <AlertCircle className="h-4 w-4" aria-hidden="true" />}
      <span>{validatedProps.message}</span>
    </div>
  );

  // Wrap with animation if needed
  return validatedProps.animate ? (
    <MotionContainer
      variant="slide"
      initial={{ opacity: 0, height: 0, y: -5 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </MotionContainer>
  ) : (
    content
  );
}
