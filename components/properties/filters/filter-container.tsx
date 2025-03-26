"use client";

import { ChevronDown } from "lucide-react";
import React, { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterContainerProps {
  /** Label to display on the filter button */
  label: React.ReactNode;
  /** Whether to use compact mode (smaller size) */
  compact?: boolean;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Content to display in the popover. Can be a function that receives close handler */
  children: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  /** Optional callback when the popover closes */
  onClose?: () => void;
}

/**
 * A reusable container component for property filters
 * Handles the popover, trigger button, and consistent styling
 */
export function FilterContainer({
  label,
  compact = false,
  disabled = false,
  children,
  onClose,
}: FilterContainerProps) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn(
            "flex items-center gap-1 text-foreground justify-between font-normal",
            compact ? "h-9" : "h-10"
          )}
          disabled={disabled}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-50" align={compact ? "center" : "start"}>
        {typeof children === "function" ? children(handleClose) : children}
      </PopoverContent>
    </Popover>
  );
}
