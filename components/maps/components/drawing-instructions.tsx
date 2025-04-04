"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";

interface ThemeColors {
  backgroundTransparent: string;
  border: string;
  text: string;
  shadow: string;
  textHighlight: string;
  textMuted: string;
  indicator: string;
  primary: string;
}

interface DrawingInstructionsProps {
  isMobileDevice: boolean;
  showTips: boolean;
  toggleTips: (e: React.MouseEvent) => void;
  themeColors: ThemeColors;
  isDarkMode: boolean;
  renderControls?: {
    drawingTipsToggleButton?: React.ReactNode;
  };
}

/**
 * Component for displaying drawing instructions and tips
 * Provides different UI for mobile and desktop devices
 */
export function DrawingInstructions({
  isMobileDevice,
  showTips,
  toggleTips,
  themeColors,
  isDarkMode,
  renderControls,
}: DrawingInstructionsProps) {
  if (isMobileDevice) {
    // Mobile instructions
    return (
      <div className="absolute bottom-20 left-4 z-20 pointer-events-auto">
        {showTips ? (
          <div
            className="backdrop-blur-sm p-3 rounded-md shadow-md max-w-[180px]"
            style={{
              backgroundColor: themeColors.backgroundTransparent,
              borderColor: themeColors.border,
              borderWidth: "1px",
              color: themeColors.text,
              boxShadow: `0 4px 6px ${themeColors.shadow}`,
            }}
          >
            <div className="flex justify-between mb-1">
              <div className="font-medium text-xs" style={{ color: themeColors.textHighlight }}>
                Drawing Tips:
              </div>
              <button
                onClick={toggleTips}
                className="hover:opacity-80"
                style={{ color: themeColors.textMuted }}
                aria-label="Close tips"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="text-xs space-y-1" style={{ color: themeColors.text }}>
              <li className="flex items-start gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1"
                  style={{ backgroundColor: themeColors.indicator }}
                />
                <span>Use finger to draw</span>
              </li>
              <li className="flex items-start gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1"
                  style={{ backgroundColor: themeColors.indicator }}
                />
                <span>Draw slowly for accuracy</span>
              </li>
              <li className="flex items-start gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1"
                  style={{ backgroundColor: themeColors.indicator }}
                />
                <span>Simple shapes work best</span>
              </li>
            </ul>
          </div>
        ) : renderControls?.drawingTipsToggleButton ? (
          <div onClick={toggleTips}>{renderControls.drawingTipsToggleButton}</div>
        ) : (
          <button
            onClick={toggleTips}
            className="rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: themeColors.primary,
              color: isDarkMode ? "#1f2937" : "#ffffff",
              boxShadow: `0 4px 6px ${themeColors.shadow}`,
            }}
            aria-label="Show drawing tips"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Desktop instructions
  return (
    <div
      className="absolute top-1/2 left-8 transform -translate-y-1/2 backdrop-blur-sm p-3 rounded-md shadow-md z-20 max-w-xs"
      style={{
        backgroundColor: themeColors.backgroundTransparent,
        borderColor: themeColors.border,
        borderWidth: "1px",
        color: themeColors.text,
        boxShadow: `0 4px 6px ${themeColors.shadow}`,
      }}
    >
      <div className="font-medium mb-2" style={{ color: themeColors.textHighlight }}>
        Drawing Tips:
      </div>
      <ul className="text-sm space-y-1" style={{ color: themeColors.text }}>
        <li className="flex items-center gap-1">
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: themeColors.indicator }}
          />
          <span>Click and drag to draw a shape</span>
        </li>
        <li className="flex items-center gap-1">
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: themeColors.indicator }}
          />
          <span>Release to complete drawing</span>
        </li>
        <li className="flex items-center gap-1">
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: themeColors.indicator }}
          />
          <span>Simple shapes work best</span>
        </li>
      </ul>
    </div>
  );
}
