"use client";

import React from "react";
import { FilterContainer } from "./filter-container";

interface FilterItemProps {
  /** Label to display on the filter button */
  label: string;
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Filter content component */
  children: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  /** Optional callback when the filter popover closes */
  onClose?: () => void;
  /** Optional badge to show on the filter (e.g. count of selected items) */
  badge?: React.ReactNode;
  /** Optional custom class names */
  className?: string;
}

/**
 * A generic wrapper for filter items with consistent styling
 * Uses FilterContainer internally and adds common functionality
 */
export function FilterItem({
  label,
  compact = false,
  disabled = false,
  children,
  onClose,
  badge,
  className,
}: FilterItemProps) {
  // Construct the display label with optional badge
  const displayLabel = badge ? (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {badge}
    </div>
  ) : (
    label
  );

  return (
    <div className={className}>
      <FilterContainer label={displayLabel} compact={compact} disabled={disabled} onClose={onClose}>
        {children}
      </FilterContainer>
    </div>
  );
}
