import PropertiesPageClient from "@/components/properties/page-client";
import React from "react";

/**
 * Properties V2 page - using refactored components
 * Server component that renders the client component
 */
export default function PropertiesV2Page() {
  return <PropertiesPageClient />;
}

export const metadata = {
  title: "Properties V2 - Listd",
  description: "Browse properties using our refactored components",
};
