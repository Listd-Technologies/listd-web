// This file is a Server Component that exports metadata and the client component

import { Metadata } from "next";
import PropertiesPageClient from "./client";

export const metadata: Metadata = {
  title: "Property Listings | Listd",
  description: "Browse available properties for sale and rent",
};

export default function PropertiesPage() {
  return <PropertiesPageClient />;
}
