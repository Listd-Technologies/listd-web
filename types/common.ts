/**
 * Common type definitions used across the application
 */

/**
 * Generic children prop type
 */
export interface ChildrenProps {
  children: React.ReactNode;
}

/**
 * Common props for most UI components
 */
export interface BaseComponentProps {
  className?: string;
}

/**
 * Base props with children
 */
export interface BaseProps extends BaseComponentProps, ChildrenProps {}

/**
 * Props for components with a label
 */
export interface LabeledProps extends BaseComponentProps {
  label?: string;
  hideLabel?: boolean;
}

/**
 * Props for components with a description
 */
export interface DescribedProps extends BaseComponentProps {
  description?: string;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  disabled?: boolean;
}

/**
 * Props for components with loading state
 */
export interface LoadingProps {
  isLoading?: boolean;
}
