"use client";
import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function Banner({ title }) {
  const { translations } = useContext(LanguageContext);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const nav = document.querySelector("nav"); // adjust if your navbar uses a different element
    if (nav) {
      setNavHeight(nav.offsetHeight);
    }
  }, []);

  return (
    // <div
    //   className="relative md:bg-[url('/insights/InsightsBanner-New.jpg')] bg-[url('/insights/NewsMobileBanner.jpg')] bg-cover bg-center"
    //   style={{ height: "550px" }}
    // >

    <div
      className="relative bg-[url('/insights/NewsMobileBanner.jpg')] bg-cover bg-center md:bg-[url('/insights/InsightsBanner-New.jpg')]"
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
          {translations.aarnaNewsTitle.aarnaNews}
        </h1>
      </div>
    </div>
  );
}
