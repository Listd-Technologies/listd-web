"use client";

import Link from "next/link";

// Define the type for footer links
type FooterLink = {
  href: string;
  label: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const footerColumns: FooterColumn[] = [
  {
    title: "SELL A HOME",
    links: [
      { href: "/request-offer", label: "Request an offer" },
      { href: "/pricing", label: "Pricing" },
      { href: "/reviews", label: "Reviews" },
      { href: "/stories", label: "Stories" },
    ],
  },
  {
    title: "BUY A HOME",
    links: [
      { href: "/buy", label: "Buy" },
      { href: "/finance", label: "Finance" },
    ],
  },
  {
    title: "BUY, RENT AND SELL",
    links: [
      { href: "/properties", label: "Buy and sell properties" },
      { href: "/rent", label: "Rent home" },
      { href: "/builder-trade-up", label: "Builder trade-up" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { href: "/company", label: "Company" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/contact", label: "Contact" },
      { href: "/investors", label: "Investors" },
    ],
  },
  {
    title: "TERMS & PRIVACY",
    links: [
      { href: "/trust", label: "Trust & Safety" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy-policy", label: "Privacy Policy" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/guides", label: "Guides" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      {/* Main footer with columns */}
      <div className="py-12 md:py-16 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-12 md:mb-16">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="inline-flex items-center">
                <div className="size-6 rounded-full bg-primary mr-2"></div>
                <span className="text-xl font-bold">Listd</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-16">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright footer */}
      <div className="py-4 border-t">
        <div className="container mx-auto px-4">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Listd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
