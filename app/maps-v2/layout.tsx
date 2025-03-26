"use client";

import React, { useEffect } from "react";

/**
 * Layout for the Maps V2 testing page
 * This layout removes the footer and ensures the map fills all available space
 */
export default function MapsV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Effect to disable scrolling on the body when the maps layout is mounted
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
      {/* Add a global style to hide the footer in the maps page */}
      <style jsx global>{`
        /* Hide the footer only on maps pages */
        body:has(.maps-v2-layout) footer {
          display: none;
        }
        
        /* Disable scrolling on the body for maps pages */
        body:has(.maps-v2-layout) {
          overflow: hidden;
        }
      `}</style>
      <div className="maps-v2-layout h-screen">{children}</div>
    </>
  );
}
