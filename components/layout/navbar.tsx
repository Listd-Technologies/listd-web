"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/properties", label: "Properties", preserveParams: true },
  { href: "/valuation", label: "Valuation" },
  { href: "/manage-listings", label: "Manage Listings" },
];

// Dev-only links for testing, will only be shown in development mode
const devLinks = [{ href: "/maps-v2", label: "Maps V2" }];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Debug effect to log when search params change
  useEffect(() => {
    if (searchParams.toString() !== "") {
      console.log("🧭 Navbar - Current URL parameters:", searchParams.toString());
    }
  }, [searchParams]);

  // Function to get the correct href
  // For properties link we need to preserve all URL parameters
  const getNavHref = (link: { href: string; preserveParams?: boolean }) => {
    if (link.preserveParams && searchParams.toString()) {
      const fullUrl = `${link.href}?${searchParams.toString()}`;
      console.log(`🔗 Navbar - Creating link with preserved params: ${fullUrl}`);
      return fullUrl;
    }
    return link.href;
  };

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 mr-8">
              <span className="text-2xl font-bold">Listd</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={getNavHref(link)}
                  className={cn(
                    "text-sm px-5 py-2 font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dev-only links */}
              {isDevelopment &&
                devLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm px-5 py-2 font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-foreground/80",
                      "bg-amber-100 dark:bg-amber-900/40 rounded-md mx-1"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <ModeToggle />
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 px-5 py-2 h-10 rounded-md hidden sm:inline-flex"
            >
              <Link href="/login">Login</Link>
            </Button>

            {/* Mobile menu button */}
            <button
              className="p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t py-3">
          <div className="container px-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getNavHref(link)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium p-2 transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary bg-accent/50 rounded-md"
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Dev-only links in mobile menu */}
            {isDevelopment &&
              devLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium p-2 transition-colors hover:text-primary",
                    pathname === link.href
                      ? "text-primary bg-accent/50 rounded-md"
                      : "text-foreground/80",
                    "bg-amber-100 dark:bg-amber-900/40 rounded-md"
                  )}
                >
                  {link.label}
                </Link>
              ))}

            <Button asChild className="bg-primary hover:bg-primary/90 mt-2 w-full">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
