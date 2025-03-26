"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className = "", delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}

// FAQ items with real estate valuation questions
const faqItems = [
  {
    question: "How accurate is the property valuation?",
    answer:
      "Our property valuation tool uses advanced algorithms and comprehensive market data to provide estimates that are typically within 5-10% of actual market value. However, accuracy may vary based on property specifics, market conditions, and data availability.",
  },
  {
    question: "What factors influence my property's value?",
    answer:
      "Multiple factors affect property value, including location, property size, condition, age, amenities, recent comparable sales, market trends, economic conditions, and neighborhood developments.",
  },
  {
    question: "How often should I get my property valued?",
    answer:
      "We recommend getting a new valuation every 6-12 months, or whenever significant changes occur in your property or the local market. Regular valuations help you stay informed about your investment's worth.",
  },
  {
    question: "Can I use this valuation for loan or mortgage purposes?",
    answer:
      "While our valuation provides a helpful estimate, most lenders require an official appraisal from a licensed professional for loan approval. Our valuation can give you a good starting point before pursuing formal financing.",
  },
  {
    question: "Why might the valuation differ from my expectations?",
    answer:
      "Valuations may differ from expectations due to market changes, unique property features not captured in automated models, recent renovations, or neighborhood factors. For a more precise valuation, consider consulting a local real estate professional.",
  },
];

export function AnimatedFaqSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="max-w-3xl mx-auto"
    >
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <AccordionItem value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  );
}
