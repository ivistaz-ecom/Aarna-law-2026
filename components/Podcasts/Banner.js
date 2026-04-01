"use client";
import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function Banner({ title }) {
  const { translations } = useContext(LanguageContext);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const nav = document.querySelector("nav"); // change selector if your navbar is different
    if (nav) {
      setNavHeight(nav.offsetHeight);
    }
  }, []);

  const getTitle = () => {
    switch (title) {
      case "insight":
        return "Insight";
      case "aarna-news":
        return "Aarna News";
      case "publication":
        return "Publications";
      case "podcast":
        return "Podcasts";
      default:
        return "Aarna Law";
    }
  };

  return (
    // <div
    //   className="relative md:bg-[url('/insights/InsightsBanner.jpg')] bg-[url('/insights/InsightsMobileBanner.jpg')] bg-cover bg-center"
    //   style={{ height: "550px" }}
    // >
    <div
      className="relative bg-[url('/insights/PodcastMobileBanner.jpg')] bg-top md:bg-[url('/insights/PodcastDesktop.jpg')] md:bg-cover md:bg-bottom"
      style={{ height: "550px" }}
    >
      <div
        className="absolute mt-20 flex w-full items-center  justify-center md:mt-0"
        style={{
          top: navHeight ? `${(550 - navHeight) / 1.8 + navHeight}px` : "50%",
          transform: "translateY(-50%)",
        }}
      >
        <h1 className="bg-black/50 px-4 py-5 text-2xl font-bold text-white md:text-[36px]">
          {getTitle()}
          {/* Or use translations if needed:
              {translations.podcastsTitle.podcasts}
          */}
        </h1>
      </div>
    </div>
  );
}
