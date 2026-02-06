"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import ContactModal from "@/components/ModalContact/page";
import { initFlowbite } from "flowbite";
import { LanguageContext } from "../../../app/context/LanguageContext";
import Faq from "@/components/FAQ/Faq";

function PracticeAreaPostDetails({ details = {}, partnersData = {}, slug, titleText = '', initialData = [] }) {
  const { language } = useContext(LanguageContext);
  const [data, setData] = useState(initialData);

  const faqs = [];
  for (let i = 1; i <= 10; i++) {
    const question = details?.acf?.[`faq_${i}`];
    const answer = details?.acf?.[`faqs_description_${i}`];
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (initialData.length > 0) return;

      try {
        const response = await fetch(
          `https://docs.aarnalaw.com/wp-json/wp/v2/industries?_embed&per_page=100`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch industries');
        }
        const result = await response.json();
        if (Array.isArray(result)) {
          const sortedData = result.sort((a, b) =>
            a.title.rendered.localeCompare(b.title.rendered)
          );
          setData(sortedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    initFlowbite();
  }, [initialData]);

  const getLocalizedTitle = (item) => {
    return language === "ta" && item.acf.tamil_title
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
                              : language === "fr" && item.acf?.french_title
                                ? item.acf.french_title
                              : item.title.rendered; // Default to English titl
  };

  const getLocalizedDescription = () => {
    return language === "ta" && details?.acf?.tamil_description
      ? details.acf.tamil_description
      : language === "kn" && details?.acf?.kannada_description
        ? details.acf.kannada_description
        : language === "te" && details?.acf?.telugu_description
          ? details.acf.telugu_description
          : language === "hi" && details?.acf?.hindi_description
            ? details.acf.hindi_description
            : language === "ml" && details?.acf?.malayalam_description
              ? details.acf.malayalam_description
              : language === "mr" && details?.acf?.marathi_description
                ? details.acf.marathi_description
                : language === "gu" && details?.acf?.gujarati_description
                  ? details.acf.gujarati_description
                  : language === "fr" && details?.acf?.french_description
                    ? details.acf.french_description
                  : details?.acf?.description || '';
  };

  const description = getLocalizedDescription();

  return (
    <>
      <style>
        {`
          .inner-content ol {
            list-style: revert-layer;
            padding-bottom: 10px;
          }
          .inner-content li {
            // padding-top: 10px;
          }
        `}
      </style>

      <div className="flex w-full flex-col py-5 lg:flex-row container mx-auto gap-10 md:px-0 px-4">
        {/* Left Content Section */}
        <div className="inner-content w-full md:w-[70%] md:p-4 ">
          <div className="prose [&_ol]:ml-8 [&_li]:ml-8">
            {description && (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            )}
          </div>

          {/* Faqs */}
          {faqs.length > 0 && <Faq faqs={faqs} />}
        </div>

        {/* Sidebar */}
        <div className="w-full bg-gray-50 md:w-[30%]">
          {/* Partners */}
          {partnersData?.partnerNames?.map((name, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-start pt-10 text-center md:px-14 md:pt-14 mb-5"
            >
              {partnersData.partnerImages?.[index] && (
                <Image
                  src={partnersData.partnerImages[index]}
                  alt={name}
                  className="mb-4 size-[200px] rounded-full bg-[#0e1333]"
                  width={200}
                  height={200}
                  priority={true}
                />
              )}
              {name && (
                <p className="text-lg font-bold text-custom-red">{name}</p>
              )}
              {partnersData.partnerDesignations?.[index] && (
                <p className="text-sm font-semibold">
                  {partnersData.partnerDesignations[index]}
                </p>
              )}
            </div>
          ))}

          {partnersData?.partnerNames?.length > 0 && (
            <div className="flex w-full justify-center">
              <ContactModal
                btnName="CONTACT PARTNER"
                textColor="text-black"
                modalTitle={titleText}
                btnType="contactPartner"
                id="contactPartner"
              />
            </div>
          )}

          {/* Quick Links */}
          <div className="w-full md:p-2 p-5 pt-10">
            <h2 className="font-bold md:pt-5">Quick Links</h2>
            <hr className="my-4 border-t-2 border-red-500" />
            <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400 md:pr-10">
              {data.map((item, index) => (
                <li key={index}>
                  <Link
                    href={`/industries/${item.slug}`}
                    className={`flex border-b border-custom-red p-1 hover:text-custom-red ${item.slug === slug
                      ? "font-semibold text-custom-red"
                      : "text-black"
                      }`}
                  >
                    <p dangerouslySetInnerHTML={{ __html: getLocalizedTitle(item) }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default PracticeAreaPostDetails; 
