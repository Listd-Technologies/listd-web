"use client";

import React from "react";

interface DrawingModeIndicatorProps {
  darkMode: boolean;
}

/**
 * Visual indicator shown when drawing mode is active
 * Provides a visual border around the map to indicate drawing mode
 */
export function DrawingModeIndicator({ darkMode }: DrawingModeIndicatorProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className={`absolute inset-0 border-4 ${
          darkMode ? "border-purple-400" : "border-purple-600"
        } animate-pulse opacity-50`}
      />
    </div>
  );
}
