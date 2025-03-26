"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandlordSection() {
  return (
    <AnimatedSection
      className="py-16 md:py-20 bg-gradient-to-r from-[#6b21a8]/90 to-[#581c87]/90 text-white"
      delay={0.2}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-white/80 mb-2 text-sm font-medium">No Spam Promise</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
          Are you a landlord?
        </h2>
        <p className="text-white/90 mb-8 max-w-2xl mx-auto text-sm md:text-base">
          Discover ways to increase your home's value and get listed. No Spam.
        </p>

        <form className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto mb-8">
          <div className="relative flex-1 mb-3 sm:mb-0">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="w-full h-12 px-4 py-3 rounded-md sm:rounded-r-none bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/30"
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-white text-[#6b21a8] hover:bg-white/90 h-12 rounded-md sm:rounded-l-none px-8 font-medium"
          >
            Submit
          </Button>
        </form>

        <p className="text-white/80 text-sm">
          Join 10,000+ other landlords in our estastery community.
        </p>
      </div>
    </AnimatedSection>
  );
}
