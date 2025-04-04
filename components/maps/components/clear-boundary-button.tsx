"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";

interface ClearBoundaryButtonProps {
  darkMode: boolean;
  onClear: () => void;
  clearingBoundary: boolean;
  renderControls?: {
    clearBoundaryButton?: React.ReactNode;
  };
}

/**
 * Component for clearing the boundary area on the map
 * Uses provided custom button or falls back to default
 */
export function ClearBoundaryButton({
  darkMode,
  onClear,
  clearingBoundary,
  renderControls,
}: ClearBoundaryButtonProps) {
  return (
    <div
      className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
        clearingBoundary ? "opacity-0 scale-90" : "opacity-100 scale-100"
      }`}
    >
      {renderControls?.clearBoundaryButton ? (
        <div onClick={onClear}>{renderControls.clearBoundaryButton}</div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className={`flex items-center gap-2 ${
            darkMode
              ? "bg-gray-800/90 hover:bg-gray-700/100 border border-purple-400 text-purple-300"
              : "bg-background/90 hover:bg-background/100 border border-purple-100 text-purple-800"
          } backdrop-blur-sm shadow-md transition-all duration-200`}
          onClick={onClear}
        >
          <X className={`h-4 w-4 ${darkMode ? "text-purple-300" : "text-purple-600"}`} />
          <span>Clear area</span>
        </Button>
      )}
    </div>
  );
}
