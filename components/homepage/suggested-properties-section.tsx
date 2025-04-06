"use client"

import { AnimatedSection } from "@/components/ui/animated-section";
import Image from "next/image";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useEffect } from "react";
import { useTheme } from "next-themes";

const SuggestedPropertiesSection = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Use the resolved theme or fall back to a default during SSR
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <AnimatedSection className="pt-4 pb-12 md:px-8 container mx-auto">
      {/* <div className="container"> */}
        <div className="flex w-full items-center justify-between mb-6">
          <div className="px-4 md:px-0 space-y-2 ">
            <h2 className="text-[2rem] text-center md:text-left leading-10 sm:text-3xl font-bold">
              Based on your location
            </h2>
            <p className="text-muted-foreground text-center md:text-left text-base pb-4">
              Some of our picked properties near your location.
            </p>
          </div>

          <Button
            className={`${
              isMounted && currentTheme === "dark"
                ? "bg-[#a855f7] hover:bg-[#9333ea]"
                : "bg-[#6b21a8] hover:bg-[#581c87]"
            } text-white hidden md:flex px-6 py-6 text-base text-center font-semibold rounded-md `}
          >
            More Properties
          </Button>
        </div>

        <div className="w-full md:px-[2px] mb-8 snap-x md:snap-none snap-mandatory [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]  gap-x-4 overflow-x-auto pt-1  pb-4">
          <div className="grid px-4 md:px-0 grid-flow-col md:grid-flow-row  auto-cols-[90%] md:auto-cols-fr md:grid-cols-3 grid-rows-1 md:grid-rows-2 gap-4 md:gap-6 ">
            <div className="rounded-lg cursor-pointer md:hover:shadow-lg transition-all snap-center  shrink-0  w-full shadow overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200">
                {/* <Image src="/house-for-sale.svg" className="object-contain" alt="House for sale" width={500} height={500} /> */}
              </div>
              <div className="border-t p-3 space-y-1">
                <div className="flex justify-between gap-x-2 w-full">
                  <h3 className="text-xl flex-1 font-bold text-primary">
                    ₱ 1.92M
                  </h3>
                  
                  <Button variant="ghost" size="icon" className=" flex-shrink-0 !h-fit !w-fit">
                    <Heart className="w-full h-full text-primary" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80">
                  Cocoons (at Club Laiya)
                </p>
              </div>
            </div>

            <div className="rounded-lg cursor-pointer md:hover:shadow-lg transition-all snap-center  shrink-0  w-full shadow overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200">
                {/* <Image src="/house-for-sale.svg" className="object-contain" alt="House for sale" width={500} height={500} /> */}
              </div>
              <div className="border-t p-3 space-y-1">
                <div className="flex justify-between gap-x-2 w-full">
                  <h3 className="text-xl flex-1 font-bold text-primary">
                    ₱ 1.92M
                  </h3>
                  
                  <Button variant="ghost" size="icon" className=" flex-shrink-0 !h-fit !w-fit">
                    <Heart className="w-full h-full text-primary" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80">
                  Cocoons (at Club Laiya)
                </p>
              </div>
            </div>

            <div className="rounded-lg cursor-pointer md:hover:shadow-lg transition-all snap-center  shrink-0  w-full shadow overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200">
                {/* <Image src="/house-for-sale.svg" className="object-contain" alt="House for sale" width={500} height={500} /> */}
              </div>
              <div className="border-t p-3 space-y-1">
                <div className="flex justify-between gap-x-2 w-full">
                  <h3 className="text-xl flex-1 font-bold text-primary">
                    ₱ 1.92M
                  </h3>
                  
                  <Button variant="ghost" size="icon" className=" flex-shrink-0 !h-fit !w-fit">
                    <Heart className="w-full h-full text-primary" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80">
                  Cocoons (at Club Laiya)
                </p>
              </div>
            </div>

            <div className="rounded-lg cursor-pointer md:hover:shadow-lg transition-all snap-center  shrink-0  w-full shadow overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200">
                {/* <Image src="/house-for-sale.svg" className="object-contain" alt="House for sale" width={500} height={500} /> */}
              </div>
              <div className="border-t p-3 space-y-1">
                <div className="flex justify-between gap-x-2 w-full">
                  <h3 className="text-xl flex-1 font-bold text-primary">
                    ₱ 1.92M
                  </h3>
                  
                  <Button variant="ghost" size="icon" className=" flex-shrink-0 !h-fit !w-fit">
                    <Heart className="w-full h-full text-primary" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80">
                  Cocoons (at Club Laiya)
                </p>
              </div>
            </div>

            <div className="rounded-lg cursor-pointer md:hover:shadow-lg transition-all snap-center  shrink-0  w-full shadow overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200">
                {/* <Image src="/house-for-sale.svg" className="object-contain" alt="House for sale" width={500} height={500} /> */}
              </div>
              <div className="border-t p-3 space-y-1">
                <div className="flex justify-between gap-x-2 w-full">
                  <h3 className="text-xl flex-1 font-bold text-primary">
                    ₱ 1.92M
                  </h3>
                  
                  <Button variant="ghost" size="icon" className=" flex-shrink-0 !h-fit !w-fit">
                    <Heart className="w-full h-full text-primary" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80">
                  Cocoons (at Club Laiya)
                </p>
              </div>
            </div>

            <div className="rounded-lg cursor-pointer md:hover:shadow-lg transition-all snap-center  shrink-0  w-full shadow overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200">
                {/* <Image src="/house-for-sale.svg" className="object-contain" alt="House for sale" width={500} height={500} /> */}
              </div>
              <div className="border-t p-3 space-y-1">
                <div className="flex justify-between gap-x-2 w-full">
                  <h3 className="text-xl flex-1 font-bold text-primary">
                    ₱ 1.92M
                  </h3>
                  
                  <Button variant="ghost" size="icon" className=" flex-shrink-0 !h-fit !w-fit">
                    <Heart className="w-full h-full text-primary" />
                  </Button>
                </div>
                <p className="text-sm text-foreground/80">
                  Cocoons (at Club Laiya)
                </p>
              </div>
            </div>


              {/* needed for mobile to let the last child to be centered  */}
            <div className="w-px md:hidden"></div>
          </div>
        </div>

        <div className="px-4 mb-10 md:hidden">
          <Button
            className={`${
              isMounted && currentTheme === "dark"
                ? "bg-[#a855f7] hover:bg-[#9333ea]"
                : "bg-[#6b21a8] hover:bg-[#581c87]"
            } text-white px-6 py-3 md:px-8 md:py-6 h-auto text-base md:text-lg font-semibold rounded-md w-full sm:w-auto`}
          >
            More Properties
          </Button>
        </div>
      {/* </div> */}
      
    </AnimatedSection>
  );
};

export default SuggestedPropertiesSection;
