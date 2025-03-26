"use client";

import React from "react";

/**
 * Layout component for the Property Showcase route
 * Uses the same layout as the parent properties route
 */
export default function ShowcaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="properties-layout-showcase">{children}</div>;
}
