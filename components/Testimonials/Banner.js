"use client";
import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function Banner() {
  const { translations } = useContext(LanguageContext);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const nav = document.querySelector("nav"); // adjust selector if your navbar element is different
    if (nav) {
      setNavHeight(nav.offsetHeight);
    }
  }, []);

  return (
    <div
      className="relative bg-[url('/PracticeArea/PracticeAreas.png')] bg-cover bg-center md:bg-[url('/PracticeArea/PracticeAreas.png')]"
      style={{ height: "550px" }}
    >
      <div
        className="absolute flex w-full items-center justify-center"
        style={{
          top: navHeight ? `${(550 - navHeight) / 1.8 + navHeight}px` : "50%",
          transform: "translateY(-50%)",
        }}
      >
        <h1 className="bg-black/50 px-4 py-2 text-2xl font-bold text-white md:text-3xl">
          {translations.testmonialBannerTitle.testmonialBannerName}
        </h1>
      </div>
    </div>
  );
}
