"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

/**
 * Skeleton loader for property cards
 */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
      <div className="relative">
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
