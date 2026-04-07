import React, { useContext } from "react";
import Link from "next/link";
import { LanguageContext } from "../../app/context/LanguageContext";

export default function JoinTeam() {
  const { translations } = useContext(LanguageContext);

  return (
    <div className="mx-auto flex container flex-col py-8 px-4 md:px-0">
      <div className="flex flex-col justify-center ">
        <p className="pb-3 text-3xl font-semibold leading-normal text-custom-blue">
        {translations.joinTeam.joinTeamTitle} 
        </p>
        <p className="font-medium">
        {translations.joinTeam.joinTeamPara}  
        </p>
      </div>
      <div className="md:mt-5 pt-8 lg:pt-0 ">
        <Link
          href="/careers"
          className="border border-custom-red px-6 py-2 text-custom-red md:hover:bg-custom-red md:hover:text-white md:px-4 md:py-1.5 md:text-sm lg:px-6 lg:py-2 lg:text-base"
        >
          {translations.joinTeam.joinTeamOpening} 
        </Link>
      </div>
    </div>
  );
}
