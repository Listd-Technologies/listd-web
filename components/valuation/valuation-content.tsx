"use client";

import { AnimatedFaqSection, AnimatedSection } from "@/components/valuation/animated-sections";
import { ValuationHero } from "@/components/valuation/valuation-hero";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, HomeIcon, Lock, Scale, ShieldCheck, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lazy load form component
const ValuationForm = dynamic(
  () =>
    import("@/components/valuation/valuation-form").then((mod) => ({ default: mod.ValuationForm })),
  {
    loading: () => (
      <div className="min-h-[650px] bg-muted/10 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading valuation form...</p>
      </div>
    ),
  }
);

// Animation variants for consistent animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Benefits list for valuation tool
const benefitsList = [
  {
    icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
    title: "Accurate Estimates",
    description:
      "Our valuation algorithm is based on real market data from thousands of properties across the Philippines.",
  },
  {
    icon: <Clock className="h-5 w-5 text-purple-600" />,
    title: "Instant Results",
    description: "Get your property valuation instantly - no waiting for callbacks or emails.",
  },
  {
    icon: <Scale className="h-5 w-5 text-purple-600" />,
    title: "Comprehensive Analysis",
    description:
      "We consider location, property size, amenities, and market trends for a detailed estimate.",
  },
  {
    icon: <HomeIcon className="h-5 w-5 text-purple-600" />,
    title: "Multiple Property Types",
    description:
      "Whether you own a condominium, house, vacant lot or warehouse, we can provide an estimate.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-purple-600" />,
    title: "Completely Free",
    description: "Our valuation tool is 100% free to use with no obligation for further services.",
  },
  {
    icon: <Lock className="h-5 w-5 text-purple-600" />,
    title: "Secure & Private",
    description: "Your data is secure and will not be shared with third parties without consent.",
  },
];

export function ValuationContent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section - Full screen height */}
      <ValuationHero />

      {/* Valuation Form and Info Section */}
      <AnimatePresence>
        {isMounted && (
          <section
            id="valuation-form-section"
            className="py-16 md:py-20 bg-background relative z-10"
          >
            <div className="container mx-auto px-4">
              <AnimatedSection>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-4 text-center"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5 }}
                >
                  Discover Your Property's Value
                </motion.h2>
                <motion.p
                  className="text-muted-foreground mb-12 text-center max-w-2xl mx-auto"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Fill in your property details below and get an accurate valuation based on current
                  market data and comparable properties.
                </motion.p>
              </AnimatedSection>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Valuation Form */}
                <AnimatedSection className="lg:col-span-7" delay={0.2}>
                  <ValuationForm />
                </AnimatedSection>

                {/* Information About Valuation Tool */}
                <AnimatedSection className="lg:col-span-5 self-start sticky top-24" delay={0.3}>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 shadow-sm border border-purple-100 dark:border-purple-800/30">
                    <h3 className="text-xl font-semibold mb-4">Why Use Our Valuation Tool?</h3>

                    <div className="space-y-4">
                      {benefitsList.map((benefit, index) => (
                        <motion.div
                          key={index}
                          className="flex gap-3 items-start"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                        >
                          <div className="mt-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm flex-shrink-0">
                            {benefit.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{benefit.title}</h4>
                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-800/30">
                      <p className="text-sm text-center text-muted-foreground italic">
                        "Get a professional estimate of your property's value in minutes, not days."
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* FAQ or Additional Information Section */}
      <AnimatePresence>
        {isMounted && (
          <motion.section
            className="py-16 bg-muted/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              </motion.div>

              <AnimatedFaqSection />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
