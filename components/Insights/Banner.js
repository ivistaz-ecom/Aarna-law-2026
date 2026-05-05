"use client";
import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function Banner({ title }) {
  const { translations } = useContext(LanguageContext);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const nav = document.querySelector("nav"); // change selector if navbar element is different
    if (nav) {
      setNavHeight(nav.offsetHeight);
    }
  }, []);

  const getTitle = () => {
    switch (title) {
      case "insight":
        return "Insights";
      case "aarna-news":
        return "Aarna News";
      case "publication":
        return "Publication";
      case "podcast":
        return "Podcast";
      default:
        return "Aarna Law";
    }
  };

  return (
    <div
      className="relative bg-[url('/insights/InsightsMobileBanner.jpg')] bg-cover bg-center md:bg-[url('/insights/InsightsBanner.jpg')]"
      style={{ height: "550px" }}
    >
      <div
        className="absolute flex w-full items-center justify-center"
        style={{
          top: navHeight ? `${(550 - navHeight) / 1.8 + navHeight}px` : "50%",
          transform: "translateY(-50%)",
        }}
      >
        <h1 className="bg-black/50 px-4 py-2 text-2xl font-bold text-white md:text-[36px]">
          {/* {getTitle()} */}
          {translations.insightsTitle.insights}
        </h1>
      </div>
    </div>
  );
}
