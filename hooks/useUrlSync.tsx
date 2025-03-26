import { usePropertyFiltersStore } from "@/lib/stores/propertyFilters";
import { generateSearchParams, parseSearchParams } from "@/lib/utils/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to synchronize the URL with the property filters store
 * - Reads URL params on initial load and updates store
 * - Updates URL when store changes
 */
export const useUrlSync = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters, updateFilters, resetFilters } = usePropertyFiltersStore();

  // On mount: Read URL params and update store
  useEffect(() => {
    if (!searchParams) return;

    const parsedParams = parseSearchParams(searchParams);
    if (Object.keys(parsedParams).length > 0) {
      updateFilters(parsedParams);
    }
  }, []);

  // On store change: Update URL
  useEffect(() => {
    const newSearchParams = generateSearchParams(filters);
    const url = pathname + (newSearchParams ? `?${newSearchParams}` : "");

    // Only update if URL would actually change
    const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (url !== currentUrl) {
      router.replace(url, { scroll: false });
    }
  }, [filters, pathname, router]);

  // Expose a direct method to clear URL and store in one operation
  const clearAllFilters = () => {
    // Reset store first
    resetFilters();

    // Then immediately replace URL with pathname only - no debounce
    // Force a new replace to avoid any race conditions with onChange handlers
    setTimeout(() => {
      router.replace(pathname, { scroll: false });
      console.log(
        "🧹 clearAllFilters: Reset all filters and cleared URL - removed all kebab-case parameters"
      );
    }, 0);
  };

  return { clearAllFilters };
};
