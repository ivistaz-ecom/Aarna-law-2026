"use client";

import React from "react";
import Link from "next/link";
import { contactAddress, mapEmbedUrlNetwork } from "@/utils/data";
import { location, direction } from "@/utils/icons";
import OurNetwork from "../HomePage/OurNetwork";
import { LanguageContext } from "../../app/context/LanguageContext";
import { useContext } from "react";

/**
 * Our Locations: map + office addresses + directions (separate from Contact Us form).
 * @param {object} props
 * @param {"default"|"contact"} [props.variant="default"] — contact page uses animated map presentation
 */
export default function Address({ variant = "default" }) {
  const { translations } = useContext(LanguageContext);
  const showOfficeCards = variant === "contact";
  const animatedMap = variant === "contact";
  const useContactCardMaps = variant === "contact";
  const mapBarTitle = "Aarna Law - Our Networks";
  const buildOfficeMapEmbedUrl = (office) => {
    if (office?.mapEmbedUrl) return office.mapEmbedUrl;
    if (!office?.address) return "";
    const query = encodeURIComponent(office.address);
    const type = useContactCardMaps
      ? office?.cardMapType || "roadmap"
      : "roadmap";
    if (type === "satellite") {
      return `https://www.google.com/maps?q=${query}&t=k&z=17&output=embed`;
    }
    if (type === "terrain") {
      return `https://www.google.com/maps?q=${query}&t=p&z=16&output=embed`;
    }
    return `https://www.google.com/maps?q=${query}&t=m&z=16&output=embed`;
  };

  const renderOfficeCards = (items) => (
    <div className="grid gap-10 pb-10 lg:grid-cols-3">
      {items.map((office, index) => (
        <div
          className="rounded-lg bg-[#F8F9FB] p-8 shadow-md"
          key={`${office.location}-${index}`}
        >
          {buildOfficeMapEmbedUrl(office) ? (
            <div className="relative mb-5 overflow-hidden rounded-lg border border-[#1C386A]/10 bg-white">
              <iframe
                src={buildOfficeMapEmbedUrl(office)}
                title={`${office.location || "Office"} map`}
                className="h-44 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {office.direction?.trim() ? (
                <Link
                  href={office.direction}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${office.location || "Office"} directions`}
                  className="absolute inset-0 z-10"
                />
              ) : null}
            </div>
          ) : null}

          {office.location ? (
            <h3 className="text-xl font-bold text-[#1C386A]">
              {office.location}
            </h3>
          ) : null}

          {office.address ? (
            <div className="flex items-start gap-2 py-3">
              <div className="mt-1 shrink-0 text-[#1C386A]" aria-hidden>
                {location}
              </div>
              <p className="text-gray-800">{office.address}</p>
            </div>
          ) : null}

          {office.direction?.trim() ? (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[#1C386A]" aria-hidden>
                {direction}
              </span>
              <Link
                href={office.direction}
                className="font-medium text-custom-red underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </Link>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  return (
    <section
      className="bg-white py-12 md:py-16"
      id="our-locations"
      aria-labelledby={showOfficeCards ? "our-locations-heading" : undefined}
      aria-label={!showOfficeCards ? "Our networks map" : undefined}
    >
      <div className="container mx-auto px-4 md:px-0">
        {showOfficeCards ? (
          <>
            <h2
              id="our-locations-heading"
              className="mb-3 border-b-2 border-[#EE3C23] pb-[15px] text-left text-[26px] font-semibold leading-normal tracking-[1.6px] text-[#1C386A]"
            >
              Our Locations
            </h2>
            {renderOfficeCards(contactAddress)}

            <h3 className="mb-6 mt-8 text-center text-[22px] font-semibold leading-normal tracking-[0.08em] text-custom-red md:text-[24px]">
            {translations.network.networkTitle}
            </h3>
          </>
        ) : (
          <h3 className="mb-6 mt-2 text-center text-[22px] font-semibold leading-normal tracking-[0.08em] text-custom-red md:text-[24px]">
            {translations.network.networkTitle}
          </h3>
        )}

        <OurNetwork
          embedUrl={mapEmbedUrlNetwork}
          showHeading={false}
          mapBarTitle={mapBarTitle}
          iframeTitle="Aarna Law — all office locations map"
          animatedPresentation={animatedMap}
        />
      </div>
    </section>
  );
}
