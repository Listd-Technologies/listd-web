import { z } from "zod";

/**
 * Schema for FormError component props
 */
export const formErrorSchema = z.object({
  /**
   * Error message to display
   */
  message: z.string().optional(),

  /**
   * Associated form control ID for better accessibility
   */
  controlId: z.string().optional(),

  /**
   * Whether to show the error icon
   * @default true
   */
  showIcon: z.boolean().optional().default(true),

  /**
   * Whether to animate the error message
   * @default true
   */
  animate: z.boolean().optional().default(true),

  /**
   * Additional class names
   */
  className: z.string().optional(),
});

/**
 * Type for FormError component props derived from the schema
 */
export type FormErrorSchemaType = z.infer<typeof formErrorSchema>;

/**
 * Schema for MotionContainer component props
 */
export const motionContainerSchema = z.object({
  /**
   * Children elements
   */
  children: z.any(),

  /**
   * Additional class names
   */
  className: z.string().optional(),

  /**
   * Animation variant to use
   * @default "fade"
   */
  variant: z.enum(["fade", "slide", "scale", "none"]).optional().default("fade"),

  /**
   * Custom animation variants if needed
   */
  customVariants: z.any().optional(),

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay: z.number().min(0).optional().default(0),

  /**
   * Whether the component should animate when it enters the viewport
   * @default false
   */
  animateOnScroll: z.boolean().optional().default(false),

  /**
   * Threshold for when the animation should trigger (0-1)
   * @default 0.1
   */
  threshold: z.number().min(0).max(1).optional().default(0.1),

  /**
   * HTML tag to use for the container
   * @default "div"
   */
  as: z.any().optional().default("div"),
});

/**
 * Type for MotionContainer component props derived from the schema
 */
export type MotionContainerSchemaType = z.infer<typeof motionContainerSchema>;
