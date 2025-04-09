"use client";


export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* Apply any profile-specific layout or styles here */}
      {children}
      
      {/* Any profile-specific UI elements that should appear on all profile pages */}
      <style jsx global>{`
        /* Hide the footer on profile pages */
        body:has(.hide-footer) footer {
          display: none;
        }
      `}</style>
    </div>
  );
} 