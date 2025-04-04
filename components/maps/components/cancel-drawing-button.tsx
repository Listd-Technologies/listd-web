"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";

interface CancelDrawingButtonProps {
  themeColors: {
    backgroundTransparent: string;
    primary: string;
    textHighlight: string;
    shadow: string;
  };
  onCancel: () => void;
  renderControls?: {
    cancelDrawingButton?: React.ReactNode;
  };
}

/**
 * Component for rendering the cancel drawing button
 * Uses provided custom button or falls back to default
 */
export function CancelDrawingButton({
  themeColors,
  onCancel,
  renderControls,
}: CancelDrawingButtonProps) {
  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
      {renderControls?.cancelDrawingButton ? (
        <div onClick={onCancel}>{renderControls.cancelDrawingButton}</div>
      ) : (
        <Button
          onClick={onCancel}
          className="flex items-center gap-2 shadow-md transition-all duration-200 backdrop-blur-sm py-2 px-4 font-medium"
          style={{
            backgroundColor: themeColors.backgroundTransparent,
            borderColor: themeColors.primary,
            borderWidth: "2px",
            color: themeColors.textHighlight,
            boxShadow: `0 4px 6px ${themeColors.shadow}`,
          }}
        >
          <X className="w-4 h-4 mr-1" style={{ color: themeColors.textHighlight }} />
          Cancel Drawing
        </Button>
      )}
    </div>
  );
}
