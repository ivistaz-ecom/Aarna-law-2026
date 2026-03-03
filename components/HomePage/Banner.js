"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { homeBanner } from "../../utils/homebanner-data";

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % homeBanner.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const banner = homeBanner[currentIndex];
  const isFirstBanner = currentIndex === 0;

  return (
    <div className="relative w-full">
      <h1 className="sr-only">Client-Centric Problem Solving</h1>

      {/* Mobile */}
      <div className="relative lg:hidden">
        <Image
          src={banner.mobileBannerUrl}
          alt={banner.bannerText}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "500px" }}
          loading="eager"
          priority={isFirstBanner}
          placeholder="blur"
          blurDataURL={banner.mobileBannerUrl}
        />
        <div className="absolute inset-0 z-10 mt-40 flex flex-col items-center justify-center p-4 text-center text-white">
          <p className="text-4xl font-bold">{banner.bannerText}</p>
          <p className="py-8 text-xl">{banner.bannerPara}</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative hidden lg:block">
        <Image
          src={banner.bannerUrl}
          alt={banner.bannerText}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "500px" }}
          loading={isFirstBanner ? "eager" : "lazy"}
          priority={isFirstBanner}
          placeholder="blur"
          blurDataURL={banner.bannerUrl}
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 pt-[200px] text-center text-white">
          <p className="text-4xl font-bold lg:text-4xl">{banner.bannerText}</p>
          <p className="py-8 text-xl lg:w-7/12">{banner.bannerPara}</p>
        </div>
      </div>
    </div>
  );
}
