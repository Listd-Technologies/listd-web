"use client";

import React, { useEffect } from "react";

/**
 * Properties page layout that doesn't include the footer
 * This works by keeping the children (which will be rendered within the main tag in the root layout)
 * and adding a style to hide the footer and disable global scrolling
 */
export default function PropertiesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Effect to disable scrolling on the body when the properties layout is mounted
  useEffect(() => {
    // Save the original overflow value
    const originalOverflow = document.body.style.overflow;

    // Disable scrolling on the body
    document.body.style.overflow = "hidden";

    // Restore the original overflow value when the component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <>
      {/* Add a global style to hide the footer in the properties page */}
      <style jsx global>{`
        /* Hide the footer only on properties pages */
        body:has(.properties-layout) footer {
          display: none;
        }
        
        /* Disable scrolling on the body for properties pages */
        body:has(.properties-layout) {
          overflow: hidden;
        }
      `}</style>
      <div className="properties-layout">{children}</div>
    </>
  );
}
