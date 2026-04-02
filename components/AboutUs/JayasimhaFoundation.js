import React, { useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function JayasimhaFoundation() {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="">
      <div className="mx-auto grid container py-12 lg:grid-cols-2 lg:min-h-[600px] px-4 md:px-0">
        {/* Text Section */}
        <div className="order-2 flex items-center justify-center lg:order-1">
          <div className="flex flex-col items-start justify-center p-2 lg:pe-12">
            <h2 className="hidden pb-2 text-2xl font-bold text-custom-blue md:block">
              {translations.jayasimhaFoundation.jayasimhaTitle}
            </h2>
            <p className="mt-4 py-2 md:mt-0">
              {translations.jayasimhaFoundation.jayasimhaPara1}
            </p>
            <p className="mt-4 py-2 md:mt-0">
              {translations.jayasimhaFoundation.jayasimhaPara2}
            </p>
            <p className="mt-4 py-2 md:mt-0">
              {translations.jayasimhaFoundation.jayasimhaPara3}
            </p>
            <p className="mt-4 py-2 md:mt-0">
              {translations.jayasimhaFoundation.jayasimhaPara4}
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <Image
            src="/aboutUs/Jayasimha-Foundation.png"
            width={500}
            height={500}
            className="w-full h-auto max-h-[600px] object-contain"
            alt=""
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
