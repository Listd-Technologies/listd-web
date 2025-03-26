/**
 * Responsive breakpoint constants for consistent usage across the application
 * Based on Tailwind CSS default breakpoints
 *
 * IMPORTANT USAGE GUIDELINES:
 *
 * 1. For CSS/component responsive behavior, use Tailwind's built-in responsive modifiers:
 *    <div className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
 *
 * 2. Use these JavaScript constants ONLY when you need breakpoint values in JS logic
 *    such as event listeners, hooks, or conditional rendering that can't be
 *    achieved with CSS alone.
 *
 * 3. Always prefer CSS-based responsive design over JavaScript-based detection.
 */

// Tailwind CSS breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Application-specific layout breakpoints
export const LAYOUT_BREAKPOINTS = {
  // App-specific breakpoints that determine layout changes
  MOBILE: BREAKPOINTS.sm,
  TABLET: BREAKPOINTS.md,
  DESKTOP_SMALL: BREAKPOINTS.lg,
  DESKTOP: BREAKPOINTS.xl,
  DESKTOP_LARGE: BREAKPOINTS["2xl"],

  // Layout-specific breakpoints
  SPLIT_VIEW: 1180, // Switch between split and single view
};
