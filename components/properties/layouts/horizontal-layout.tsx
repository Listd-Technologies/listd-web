"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface HorizontalLayoutProps {
  /** Content to display */
  children: React.ReactNode;
  /** Optional class name for additional styling */
  className?: string;
}

/**
 * Layout component for horizontal map-only view
 * Used for full-screen map display
 */
export function HorizontalLayout({ children, className }: HorizontalLayoutProps) {
  return <div className={cn("w-full h-full", className)}>{children}</div>;
}
