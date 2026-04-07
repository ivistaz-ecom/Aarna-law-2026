"use client";
import React, { useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../../app/context/LanguageContext";

const WhatWeDo = () => {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="container mx-auto grid gap-8 px-4 py-12 md:px-0 lg:grid-cols-2">
      {/* Image Section */}
      <div className="flex min-h-[400px] items-center justify-center lg:min-h-[500px]">
        <Image
          src="/whatWeDo/What_we_do.jpg"
          width={500}
          height={500}
          className="h-full max-h-[600px] w-full object-cover"
          alt="What We Do"
          loading="lazy"
        />
      </div>

      {/* Text Section */}
      <div className="flex min-h-[400px] flex-col justify-center p-2 lg:min-h-[500px] lg:pl-5">
        <h2 className="mt-4 text-2xl font-bold text-custom-red lg:mt-0">
          {translations.whatWeDo.title}
        </h2>
        <h3 className="py-4 text-2xl font-semibold text-custom-blue md:mt-0 md:leading-10 lg:text-[32px]">
          {translations.whatWeDo.headline}
        </h3>
        <p className="text-custom-gray md:mt-0">
          {translations.whatWeDo.para1}
        </p>
        <p className="py-2 text-custom-gray md:mt-0">
          {translations.whatWeDo.para2}
        </p>
      </div>
    </div>
  );
};

export default WhatWeDo;
