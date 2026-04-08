import React, { useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../../app/context/LanguageContext";

function FounderMessage() {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="mx-auto grid container pb-12 lg:grid-cols-2 px-4 md:px-0">
      {/* Mobile title section (shows only on small screens) */}
      <div className="flex flex-col items-start justify-center p-2 lg:hidden lg:pl-12">
        <div className="mb-3">
          <Image
            src="/images/quote-png.png"
            width={100}
            height={100}
            className="h-[30px] w-auto"
            alt=""
            loading="lazy"
          />
        </div>
        <h3 className="pb-4 text-2xl font-bold text-custom-blue lg:text-3xl">
          {translations.founderMessage.founderTitle}
        </h3>
      </div>

      {/* Image Section */}
      <div className="flex items-center justify-center">
        <Image
          src="/aboutUs/founders.png"
          width={500}
          height={500}
          className="w-full h-auto max-h-[600px] object-contain"
          alt=""
          loading="lazy"
        />
      </div>

      {/* Text Section */}
      <div className="flex flex-col items-start justify-center p-2 lg:pl-12">
        {/* Quote icon & heading (desktop only) */}
        <div className="hidden lg:block mb-3">
          <Image
            src="/images/quote-png.png"
            width={100}
            height={100}
            className="h-[30px] w-auto"
            alt=""
            loading="lazy"
          />
        </div>
        <h3 className="hidden pb-4 text-xl font-semibold text-custom-blue lg:block lg:text-3xl">
          {translations.founderMessage.founderTitle}
        </h3>

        {/* Paragraph */}
        <p className="mt-4 text-custom-gray md:mt-0">
          {translations.founderMessage.founderPara}
        </p>

        {/* Founders' Names */}
        <div className="md:flex w-full justify-between py-8">
          <div>
            <p className="font-bold text-custom-blue py-2">
              {translations.founderMessage.founderName1}
            </p>
            <p>{translations.founderMessage.founderDescription1}</p>
          </div>
          <div>
            <p className="font-bold text-custom-blue py-2">
              {translations.founderMessage.founderName2}
            </p>
            <p>{translations.founderMessage.founderDescription2}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FounderMessage;
