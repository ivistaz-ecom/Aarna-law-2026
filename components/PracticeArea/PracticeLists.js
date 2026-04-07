"use client";
import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { LanguageContext } from "../../app/context/LanguageContext";

function PracticeLists({ data = [], loading = true }) {
  const { language, translations } = useContext(LanguageContext);

  return (
    <div className="mx-auto container py-12 px-4 md:px-0">
      {/* <p className="py-4 text-center font-bold text-gray-500">
        {translations.practiceAreasTitle.practiceAreas}
      </p> */}
      <p className="text-2xl font-semibold text-custom-blue md:mt-0 md:leading-10 lg:text-[32px] mx-auto w-8/12 text-center">
        {translations.practiceAreaHeading.practiceAreaHeading}
      </p>
      <p className="py-5 text-justify">
        {translations.practiceAreaPara1.practiceAreaPara1}
      </p>
      <p className="text-justify">
        {translations.practiceAreaPara2.practiceAreaPara2}
      </p>

      <div className="grid gap-4 pt-12 lg:grid-cols-4">
        {loading && (!data || data.length === 0)
          ? [...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-[200px] w-full bg-gray-300"></div>
              <div className="h-[65px] bg-[#233876]"></div>
            </div>
          ))
          : data.map((item, index) => {
            const title =
              language === "ta" && item.acf.tamil_title
                ? item.acf.tamil_title
                : language === "kn" && item.acf.kannada_title
                  ? item.acf.kannada_title
                  : language === "te" && item.acf.telugu_title
                    ? item.acf.telugu_title
                    : language === "hi" && item.acf.hindi_title
                      ? item.acf.hindi_title
                      : language === "ml" && item.acf.malayalam_title
                        ? item.acf.malayalam_title
                        : language === "mr" && item.acf.marathi_title
                          ? item.acf.marathi_title
                          : language === "gu" && item.acf.gujarati_title
                            ? item.acf.gujarati_title
                            : language === "fr" && item.acf.french_title
                              ? item.acf.french_title
                            : item.title.rendered;

            return (
              <Link
                href={`/practice-areas/${item.slug}`}
                key={index}
                className="group block"
              >
                <div className="overflow-hidden">
                  <Image
                    src={item.acf.banner_image.url}
                    width={400}
                    height={400}
                    className="h-[200px] w-full transition-transform duration-500 ease-in-out group-hover:scale-110"
                    alt={title}
                    loading="lazy"
                  />
                </div>
                <div className="flex h-[65px] items-center justify-center bg-[#233876] p-1 text-center font-semibold text-white">
                  <p dangerouslySetInnerHTML={{ __html: title }} />
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

export default PracticeLists;
