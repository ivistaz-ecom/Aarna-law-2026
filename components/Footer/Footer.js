"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { spotify, linkedIn } from "../../utils/icons";
import { legalLinks } from "../../utils/data";
import ContactModal from "@/components/ModalContact/page";
import ScrollToTop from "../ScrollToTop/ScrollToTop";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Function to check if the screen is in mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust the width as per your breakpoint
    };

    // Initial check and event listener for resize
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="pt-12">
      <div className="bg-white border-t-2 border-custom-blue">
        <div className="mx-auto grid container lg:grid-cols-2 px-4 md:px-0">
          <div className="pt-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/aarna-logo.png"
                alt="Aarna Law"
                width={600}
                height={600}
                className="md:h-20 md:w-20 h-20 w-20"
                loading="lazy"
              />
            </Link>
            <div className="flex gap-8 py-4 ps-2">
              <Link
                href="https://www.linkedin.com/company/aarna-law1/"
                className="flex items-center justify-center gap-2 text-xl text-custom-blue"
                target="_blank"
              >
                {linkedIn} LinkedIn
              </Link>

              <Link
                href="https://open.spotify.com/show/2FYjq2t4nrx3bT9UMwN55h"
                className="flex items-center justify-center gap-2 text-xl text-custom-blue"
                target="_blank"
              >
                {spotify} Spotify
              </Link>
            </div>
          </div>
          <div className="flex items-center pb-10 lg:justify-end lg:pb-0 md:ps-0 ps-2">
            <ContactModal
              btnName="Subscribe to newsletter"
              textColor="text-white"
              modalTitle="Subscribe to newsletter"
              modalTitleColor="text-custom-red"
              btnType="subscribe"
              id="subscribe"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#091F48] py-5 text-center text-white md:px-20">
        <div className="flex items-center justify-center gap-2 text-white">
          {legalLinks.map((link, index) => (
            <React.Fragment key={link.name}>
              <Link href={link.href} className="hover:underline">
                {link.name}
              </Link>
              {index < legalLinks.length - 1 && (
                <span className="mx-2">|</span> // Add separator except for the last item
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-2 text-white">
          © {currentYear} Aarna Law. All Rights Reserved
        </p>
      </div>
      <ScrollToTop />
    </div>
  );
}
