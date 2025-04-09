"use client";

import Image from "next/image";

const LoginLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <style jsx global>{`
        /* Hide the footer only on properties pages */
        body:has(.update-profile-layout) footer {
          display: none;
        }
        
        /* Disable scrolling on the body for properties pages */
        body:has(.update-profile-layout) {
          overflow: hidden;
        }
      `}</style>
      <div className="update-profile-layout bg-gray-100">
        {children}
      </div>
    </>
  );
};

export default LoginLayout;
