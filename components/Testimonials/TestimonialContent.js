"use client";
import React, { useState, useContext } from "react";
import { LanguageContext } from "../../app/context/LanguageContext";
import ModalTestimonial from "@/components/ContactUs/Modal";
import Image from "next/image";

function Testimonials() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const { language, translations } = useContext(LanguageContext);

  const handleOpenModal = (testimonial) => {
    setSelectedTestimonial(testimonial);
  };

  return (
    <>
      <div className="mx-auto w-full py-12 lg:container">
        <div className="grid gap-10 px-4 lg:grid-cols-3 lg:px-0">
          {translations.testimonialDetails.map((items, index) => (
            <div
              className="mx-auto flex h-full w-full max-w-[340px] flex-col rounded-lg bg-white shadow-lg lg:max-w-none"
              key={index}
            >
              {/* Top Section: Info and Image */}
              <div className="flex items-center p-6">
                {/* Left Side: Text */}
                <div className="min-w-0 flex-1">
                  <h2 className="flex h-12 items-center overflow-hidden text-ellipsis whitespace-nowrap text-lg  font-bold">
                    {items.name}
                  </h2>
                  <p className="flex h-10 items-center gap-2">{items.post}</p>
                  <p className="flex h-10 items-center gap-2">
                    {items.desingnation}
                  </p>
                </div>
                {/* Right Side: Image — transparent default; 3D lift only on hover */}
                {items.imageUrl && (
                  <div className="group ml-4  mr-2 mt-[50px] flex size-[96px] shrink-0 items-center justify-center rounded-full border border-red-400/70 bg-red-50/35 p-4 shadow-[0_8px_20px_-14px_rgba(239,68,68,0.45)] backdrop-blur-sm [perspective:520px] md:mr-5">
                    <div className="overflow-hidden rounded-2xl bg-transparent">
                      <Image
                        src={items.imageUrl}
                        width={90}
                        height={90}
                        className="h-[74px] w-[74px]  object-contain ring-0"
                        alt={items.name}
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section: Full Width Testimonial */}
              <div className="px-6 pb-6">
                <p className="line-clamp-4 text-gray-700">
                  {items.fullTestimonial.slice(0, 150)}...
                </p>
                <div className="mt-auto flex justify-start pt-4">
                  <button
                    className="font-medium text-custom-red"
                    onClick={() => handleOpenModal(items)}
                  >
                    {translations.readMore || "Read more"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Render Modal if there is a selected testimonial */}
        {selectedTestimonial && (
          <ModalTestimonial
            data={selectedTestimonial}
            onClose={() => setSelectedTestimonial(null)}
          />
        )}
      </div>
    </>
  );
}

export default Testimonials;
