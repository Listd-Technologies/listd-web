"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    title: "Extensive Property Listings",
    description:
      "Browse a wide range of residential properties across the Philippines, complete with detailed descriptions, high-quality images, and essential information.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>
    ),
    title: "Interactive Map Search",
    description:
      "Utilize our intuitive map feature to locate properties in your preferred areas, explore neighborhoods, and find homes that meet your criteria.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    title: "Free AVM Tool",
    description:
      "Access our Automated Valuation Model to receive instant property value estimates, helping you make informed decisions whether you're buying or selling.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    ),
    title: "Easy Property Listing",
    description:
      "List your property for rent or sale with our streamlined process. Our platform makes it simple to showcase your property to potential buyers and renters.",
  },
];

export function FeaturesSection() {
  return (
    <AnimatedSection className="py-16 md:py-20 bg-background" delay={0.1}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-20">
          <div className="lg:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              The new way to find your new home
            </h2>
            <p className="text-foreground/80 mb-6">
              Find your dream place to live in with more than 10k+ properties listed.
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-white">Evaluate</Button>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {features.slice(0, 2).map((feature, index) => (
                <div
                  key={index}
                  className="p-5 lg:p-6 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3">{feature.title}</h3>
                  <p className="text-sm text-foreground/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {features.slice(2).map((feature, index) => (
            <div
              key={index + 2}
              className="p-5 lg:p-6 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <div className="text-primary">{feature.icon}</div>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3">{feature.title}</h3>
              <p className="text-sm text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
