"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface VerticalLayoutProps {
  /** Content to display */
  children: React.ReactNode;
  /** Optional class name for additional styling */
  className?: string;
}

/**
 * Layout component for vertical list-only view
 * Used primarily on mobile and tablet screens
 */
export function VerticalLayout({ children, className }: VerticalLayoutProps) {
  return <div className={cn("w-full h-full overflow-auto", className)}>{children}</div>;
}
