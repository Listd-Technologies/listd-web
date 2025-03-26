import { cn } from "@/lib/utils";
import { fadeIn, scale, slideUp } from "@/lib/utils/animations";
import { validateProps } from "@/lib/utils/validation-utils";
import { motionContainerSchema } from "@/schemas";
import { type BaseProps } from "@/types";
import { HTMLMotionProps, Variants, motion } from "framer-motion";
import React, { ElementType } from "react";

export type AnimationVariant = "fade" | "slide" | "scale" | "none";

export interface MotionContainerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /**
   * Children elements
   */
  children: React.ReactNode;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Animation variant to use
   * @default "fade"
   */
  variant?: AnimationVariant;

  /**
   * Custom animation variants if needed
   */
  customVariants?: Variants;

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number;

  /**
   * Whether the component should animate when it enters the viewport
   * @default false
   */
  animateOnScroll?: boolean;

  /**
   * Threshold for when the animation should trigger (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * HTML tag to use for the container
   * @default "div"
   */
  as?: ElementType;
}

/**
 * A container component with built-in animation capabilities
 */
export function MotionContainer({
  children,
  className,
  variant = "fade",
  customVariants,
  delay = 0,
  animateOnScroll = false,
  threshold = 0.1,
  as = "div",
  ...props
}: MotionContainerProps) {
  // Validate props with Zod schema
  const validatedProps = validateProps(
    {
      children,
      className,
      variant,
      customVariants,
      delay,
      animateOnScroll,
      threshold,
      as,
    },
    motionContainerSchema,
    { componentName: "MotionContainer" }
  );

  // Get the appropriate animation variant
  const getVariants = (): Variants => {
    if (validatedProps.customVariants) return validatedProps.customVariants;

    switch (validatedProps.variant) {
      case "fade":
        return fadeIn;
      case "slide":
        return slideUp;
      case "scale":
        return scale;
      default:
        return {};
    }
  };

  // Get animation props based on settings
  const animationProps =
    validatedProps.variant === "none"
      ? {}
      : {
          initial: "hidden",
          animate: validatedProps.animateOnScroll ? undefined : "visible",
          whileInView: validatedProps.animateOnScroll ? "visible" : undefined,
          exit: "exit",
          viewport: validatedProps.animateOnScroll
            ? { once: true, amount: validatedProps.threshold }
            : undefined,
          variants: getVariants(),
          transition: { delay: validatedProps.delay },
        };

  // Use a type assertion for the motion component
  const Component =
    validatedProps.as === "div"
      ? motion.div
      : validatedProps.as === "span"
        ? motion.span
        : validatedProps.as === "section"
          ? motion.section
          : motion.div;

  return (
    <Component className={cn(validatedProps.className)} {...animationProps} {...props}>
      {validatedProps.children}
    </Component>
  );
}
