// This file is a Server Component that exports metadata and the client component

import { Metadata } from "next";
import PropertyShowcaseClient from "./client";

export const metadata: Metadata = {
  title: "Property Showcase | Listd",
  description: "Browse our featured properties showcase by type and listing status",
};

export default function PropertyShowcasePage() {
  return <PropertyShowcaseClient />;
}
