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
        body:has(.auth-layout) footer {
          display: none;
        }
        
        /* Disable scrolling on the body for properties pages */
        body:has(.auth-layout) {
          overflow: hidden;
        }
      `}</style>
      <div className="auth-layout flex h-screen w-screen items-center gap-x-8 bg-white p-16">
        
        <div className="flex h-full w-full flex-1 items-center justify-end">
          <div className="flex h-full max-h-[850px] items-center bg-[#efebf2] rounded-[32px]  px-8">
            <Image
              src="/house-for-sale.svg"
              alt="Vercel logomark"
              width={1000}
              height={1000}
              priority
              className="h-[350px] w-fit"
            />
          </div>
        </div>
        <div className="flex h-full flex-1 items-center justify-start">
          {children}
        </div>
      </div>
    </>
  );
};

export default LoginLayout;
