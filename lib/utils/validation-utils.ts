import { ZodError, ZodSchema } from "zod";

/**
 * Validates component props against a Zod schema
 *
 * @param props - The props to validate
 * @param schema - The Zod schema to validate against
 * @param options - Validation options
 * @returns The validated props or throws an error
 */
export function validateProps<T>(
  props: Record<string, unknown>,
  schema: ZodSchema<T>,
  options: {
    /**
     * Whether to throw an error on validation failure
     * @default true
     */
    throwOnError?: boolean;

    /**
     * Component name for better error messages
     */
    componentName?: string;
  } = {}
): T {
  const { throwOnError = true, componentName } = options;

  try {
    // Parse the props with the schema
    return schema.parse(props);
  } catch (error) {
    if (error instanceof ZodError) {
      // Format error message
      const formattedErrors = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");

      const errorMessage = componentName
        ? `Validation error in ${componentName} component:\n${formattedErrors}`
        : `Component prop validation error:\n${formattedErrors}`;

      // Log the error in development
      if (process.env.NODE_ENV !== "production") {
        console.error(errorMessage);
      }

      // Throw if required
      if (throwOnError) {
        throw new Error(errorMessage);
      }
    }

    // Rethrow unknown errors
    if (throwOnError) {
      throw error;
    }

    // Return empty object as fallback
    return {} as T;
  }
}
