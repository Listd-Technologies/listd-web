import { FeaturesSection } from "@/components/homepage/features-section";
import { HeroSection } from "@/components/homepage/hero-section";
import { LandlordSection } from "@/components/homepage/landlord-section";
import { ValuationSection } from "@/components/homepage/valuation-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listd - Buy, Rent, or Sell Properties Without Commission | Philippine Real Estate",
  description:
    "Find your dream property or list your own with Listd. Zero commissions, streamlined process, and thousands of premium listings across the Philippines to explore.",
  keywords: [
    "real estate Philippines",
    "property listing",
    "no commission real estate",
    "buy property Philippines",
    "sell property Philippines",
    "rent property Philippines",
    "BGC condos",
    "Manila properties",
    "Makati condominiums",
    "Cebu real estate",
    "Philippine property portal",
    "luxury properties Philippines",
    "residential properties Metro Manila",
    "affordable homes Philippines",
    "property valuation Philippines",
  ],
  alternates: {
    canonical: "https://listd.com",
  },
  openGraph: {
    title: "Listd - Find Your Dream Property | Zero Commission Real Estate Platform",
    description:
      "Browse thousands of properties with zero commission. Buy, sell, or rent properties across the Philippines with our modern real estate platform.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Listd - The Modern Way to Buy, Sell or Rent Properties",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
};

export default function Home() {
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Listd",
    url: "https://listd.com",
    logo: "https://listd.com/logo.png",
    description: "A modern platform to buy, sell, or rent properties without any commissions.",
    sameAs: [
      "https://www.facebook.com/listd",
      "https://www.twitter.com/listd",
      "https://www.instagram.com/listd",
      "https://www.linkedin.com/company/listd",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Real Estate Avenue",
      addressLocality: "Property City",
      addressRegion: "PR",
      postalCode: "12345",
      addressCountry: "Philippines",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-555-5555",
      contactType: "customer service",
    },
    // Add real estate specific properties
    areaServed: "Philippines",
    serviceType: ["Property Listings", "Real Estate Valuation", "Property Management"],
  };

  // Real Estate Website Schema
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Listd",
    url: "https://listd.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://listd.com/properties?location={search_term}",
      },
      "query-input": "required name=search_term",
    },
  };

  // Local Business Schema - RealEstateAgent type
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Listd Philippines",
    image: "https://listd.com/logo.png",
    "@id": "https://listd.com",
    url: "https://listd.com",
    telephone: "+1-555-555-5555",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Real Estate Avenue",
      addressLocality: "Makati City",
      addressRegion: "Metro Manila",
      postalCode: "12345",
      addressCountry: "PH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 14.5547, // Makati City coordinates
      longitude: 121.0244,
    },
    priceRange: "₱₱₱",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Metro Manila",
      },
      {
        "@type": "City",
        name: "Cebu City",
      },
      {
        "@type": "City",
        name: "Davao City",
      },
    ],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Property Listings",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Property Valuation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Property Management",
        },
      },
    ],
  };

  // FAQ Schema for common real estate questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Listd offer zero commission property listings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Listd operates on a modern business model that eliminates traditional agent commissions. We use technology to streamline the property buying, selling, and renting process, passing these savings directly to our users.",
        },
      },
      {
        "@type": "Question",
        name: "What areas in the Philippines does Listd cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Listd covers major metropolitan areas across the Philippines including Metro Manila, BGC, Makati, Quezon City, Cebu, Davao, and more. Our platform features properties from urban condominiums to suburban homes and rural investments.",
        },
      },
      {
        "@type": "Question",
        name: "How can I list my property on Listd?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Listing your property on Listd is simple. Create an account, click on 'List a Property', fill in your property details, upload photos, set your price, and publish. Our streamlined process takes just minutes, and your listing will be visible to thousands of potential buyers or renters.",
        },
      },
      {
        "@type": "Question",
        name: "What types of properties can I find on Listd?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Listd features a diverse range of properties including condominiums, houses and lots, commercial spaces, vacant lots, and warehouses. Whether you're looking for a luxury condo in BGC, a family home in Quezon City, or an investment property in Cebu, Listd has options for every need and budget.",
        },
      },
      {
        "@type": "Question",
        name: "Is Listd available throughout the Philippines?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Listd is available nationwide with particularly strong presence in Metro Manila, Cebu, and Davao. We're continually expanding our property listings across all regions of the Philippines to serve property buyers, sellers, and renters throughout the country.",
        },
      },
    ],
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      {/* Local Business Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroSection />
      <ValuationSection />
      <FeaturesSection />
      <LandlordSection />
    </>
  );
}
