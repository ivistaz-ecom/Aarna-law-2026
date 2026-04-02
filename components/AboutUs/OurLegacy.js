import React, { useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function OurLegacy() {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="container mx-auto grid gap-8 px-4 py-12 md:px-0 lg:grid-cols-2">
      {/* Text Section */}
      <div className="order-2 flex min-h-[400px] items-center justify-center lg:order-1 lg:min-h-[500px]">
        <div className="flex flex-col justify-center p-2 lg:pe-5">
          <h2 className="mt-4 text-2xl  font-bold text-custom-red lg:mt-0">
            {translations.ourLegacy.legacyTitle}
          </h2>
          <h3 className="py-2 text-2xl font-semibold text-custom-blue md:mt-0 md:leading-10 lg:text-[32px]">
            {translations.ourLegacy.legacyHeadline}
          </h3>
          <p className="py-2 text-custom-gray md:mt-0">
            {translations.ourLegacy.legacyPara}
          </p>
        </div>
      </div>

      {/* Image Section */}
      <div className="order-1 flex min-h-[400px] items-center justify-center lg:order-2 lg:min-h-[500px]">
        <Image
          src="/aboutUs/OurLegacy.png"
          width={500}
          height={500}
          className="h-full max-h-[600px] w-full object-cover"
          alt="Our Legacy"
          loading="lazy"
        />
      </div>
    </div>
  );
}
