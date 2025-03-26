"use client";

import { useUrlSync } from "@/hooks/useUrlSync";
import { ReactNode } from "react";

interface PropertyFiltersProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes the URL-store synchronization
 * This should wrap your application or page that needs property filter URL synchronization
 */
export function PropertyFiltersProvider({ children }: PropertyFiltersProviderProps) {
  // Initialize URL sync - will handle all sync in the background
  useUrlSync();

  // Just render children - all the sync magic happens in the hook
  return <>{children}</>;
}
