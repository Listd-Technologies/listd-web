"use client";

import { PropertyShowcase } from "@/components/listings/property-cards/property-showcase";
import { allProperties } from "@/components/listings/property-cards/sample-properties";
import { MotionContainer } from "@/components/ui/motion-container";
import React from "react";

/**
 * Client component for the Property Showcase page
 */
export default function PropertyShowcaseClient() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header Section */}
      <div className="w-full bg-background border-b py-6 px-4 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Property Showcase</h1>
          <p className="text-muted-foreground">
            Browse our featured properties by type and listing status
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8">
          <PropertyShowcase showAllPropertyTypes={true} properties={allProperties} maxPerType={6} />
        </div>
      </div>
    </div>
  );
}
