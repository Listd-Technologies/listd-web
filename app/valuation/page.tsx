import { ValuationContent } from "@/components/valuation/valuation-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Valuation | Listd",
  description: "Get an accurate valuation of your property with our advanced valuation tool",
};

export default function ValuationPage() {
  // Add structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Property Valuation Service",
    description: "Get an accurate valuation of your property with our advanced valuation tool",
    provider: {
      "@type": "Organization",
      name: "Listd",
      url: "https://listd.com",
    },
    serviceType: "Real Estate Valuation",
    areaServed: "Philippines",
    audience: {
      "@type": "Audience",
      audienceType: "Property Owners",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ValuationContent />
    </>
  );
}
