import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PropertyFiltersProvider } from "@/components/providers/property-filters-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6B21A8",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://listd.com"),
  title: {
    template: "%s | Listd",
    default: "Listd - Buy, Rent, or Sell Properties Easily",
  },
  description:
    "A modern platform to buy, sell, or rent properties without any commissions. Find your dream home today!",
  keywords: [
    "real estate",
    "property listing",
    "buy home",
    "rent home",
    "sell property",
    "no commission",
  ],
  authors: [{ name: "Listd Team" }],
  creator: "Listd Team",
  publisher: "Listd",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    siteName: "Listd",
    title: "Listd - Buy, Rent, or Sell Properties Easily",
    description:
      "A modern platform to buy, sell, or rent properties without any commissions. Find your dream home today!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Listd Real Estate Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Listd - Buy, Rent, or Sell Properties Easily",
    description:
      "A modern platform to buy, sell, or rent properties without any commissions. Find your dream home today!",
    creator: "@listd",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://listd.com",
  },
  icons: {
    icon: ["/favicon.ico"],
    apple: ["/apple-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ThemeProvider>
              <ReactQueryProvider>
                {/* <PropertyFiltersProvider> */}
                  <div className="flex min-h-screen flex-col">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  {/* Development Tools - always available in development mode */}
                {/* </PropertyFiltersProvider> */}
              </ReactQueryProvider>
            </ThemeProvider>
          </body>
        </html>
    </ClerkProvider>
  );
}
