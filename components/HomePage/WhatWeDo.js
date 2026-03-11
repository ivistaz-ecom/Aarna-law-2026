"use client"
import React, { useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../../app/context/LanguageContext";
import Link from "next/link";

const WhatWeDo = () => {
  const { translations } = useContext(LanguageContext);

  return (
    <>
      {/* Section 1 */}
      <div className="mx-auto grid container py-12 lg:grid-cols-2 mt-6 gap-8 px-4 md:px-0">
        <div className="flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
          <Image
            src="/whatWeDo/What_we_do.jpg"
            width={500}
            height={500}
            className="w-full h-full max-h-[600px] object-cover"
            alt="What We Do"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center min-h-[400px] lg:min-h-[500px] md:text-center lg:text-left lg:px-8">
          <h2 className="text-2xl font-bold text-custom-red mt-6 lg:mt-0 pb-2">
            {translations.whatWeDo.title}
          </h2>
          <h3 className="mb-4 text-2xl font-semibold text-custom-blue lg:text-[34px] md:leading-10">
            {translations.whatWeDo.headline}
          </h3>
          <p className="text-custom-gray">{translations.whatWeDo.para1}</p>
          <p className="py-4 text-custom-gray">{translations.whatWeDo.para2}</p>
          <Link
            href="/practice-areas"
            className="mx-auto mt-2 block border border-custom-red px-6 py-2 text-custom-red hover:bg-custom-red hover:text-white md:mx-0 w-fit"
          >
            {translations.ourServicesTitle.ourServices}
          </Link>
        </div>
      </div>

      {/* Section 2 */}
      <div className="mx-auto grid container pb-12 lg:grid-cols-2 gap-8 px-4 md:px-0">
        <div className=" flex flex-col justify-center min-h-[400px] lg:min-h-[500px] order-2 lg:order-1 md:text-center lg:text-left lg:pe-12">
          <h2 className="text-2xl font-bold text-custom-red mt-6 lg:mt-0 pb-2">
            {translations.ourLegacy1.legacyTitle1}
          </h2>
          <h3 className="py-4 text-2xl font-semibold text-custom-blue lg:text-[32px] md:leading-10">
            {translations.ourLegacy1.legacyHeadline1}
          </h3>
          <p className="text-custom-gray">{translations.ourLegacy1.legacyPara1}</p>
          <p className="py-4 text-custom-gray">{translations.ourLegacy1.legacyPara2}</p>
          <Link
            href="/about-us"
            className="mx-auto mt-2 block border border-custom-red px-6 py-2 text-custom-red hover:bg-custom-red hover:text-white md:mx-0 w-fit"
          >
            {translations.ourFirmTitle.ourFirm}
          </Link>
        </div>
        <div className=" flex items-center justify-center min-h-[400px] lg:min-h-[500px] order-1 lg:order-2">
          <Image
            src="/whatWeDo/Our_legacy.jpg"
            width={500} 
            height={500}
            className="w-full h-full max-h-[600px] object-cover"
            alt="Our Legacy"
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
};

export default WhatWeDo;
