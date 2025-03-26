import { ZodError, ZodSchema } from "zod";

/**
 * Parses form data with a Zod schema and returns the result
 * @param formData - FormData object to parse
 * @param schema - Zod schema to validate against
 * @returns Parsed data or null if validation fails
 */
export function parseFormData<T>(formData: FormData, schema: ZodSchema<T>): T | null {
  try {
    const data: Record<string, unknown> = {};

    // Convert FormData to a plain object
    for (const [key, value] of formData.entries()) {
      // Handle array values (e.g., multiple checkboxes with the same name)
      if (key.endsWith("[]")) {
        const arrayKey = key.slice(0, -2);
        if (!data[arrayKey]) {
          data[arrayKey] = [];
        }
        (data[arrayKey] as unknown[]).push(value);
      } else {
        data[key] = value;
      }
    }

    // Validate with Zod
    const result = schema.safeParse(data);

    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Form data parsing error:", error);
    return null;
  }
}

/**
 * Formats error messages from Zod validation
 * @param error - Zod error object
 * @returns Object with field names as keys and error messages as values
 */
export function formatErrors(error: ZodError | unknown): Record<string, string> {
  if (!error || typeof error !== "object" || !("format" in error)) {
    return {};
  }

  try {
    const formatted = (error as ZodError).format();
    const errors: Record<string, string> = {};

    // Extract error messages from nested format
    Object.entries(formatted).forEach(([key, value]) => {
      if (key === "_errors") return;

      if (typeof value === "object" && value && "_errors" in value) {
        const errorMessages = (value as { _errors: string[] })._errors;
        if (errorMessages.length > 0) {
          errors[key] = errorMessages[0];
        }
      }
    });

    return errors;
  } catch (err) {
    console.error("Error formatting validation errors:", err);
    return {};
  }
}
