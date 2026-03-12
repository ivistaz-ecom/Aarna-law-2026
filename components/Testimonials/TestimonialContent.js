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
      <div className="mx-auto container py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {translations.testimonialDetails.map((items, index) => (
            <div
              className="flex flex-col rounded-lg bg-white shadow-lg"
              key={index}
            >
              {/* Top Section: Info and Image */}
              <div className="flex items-center p-6">
                {/* Left Side: Text */}
                <div className="flex-1">
                  <h2 className="flex md:h-12 text-lg font-bold">{items.name}</h2>
                  <p className="flex md:h-10 gap-2 py-2">{items.post}</p>
                  <p className="flex md:h-10 items-center gap-2 py-2">
                    {items.desingnation}
                  </p>  
                </div>
                {/* Right Side: Image */}
                <div className="ml-4">
                  <Image
                    src={items.imageUrl}
                    width={90}
                    height={90}
                    className="rounded-full object-cover"
                    alt={items.name}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Bottom Section: Full Width Testimonial */}
              <div className="px-6 pb-6">
                <p className="line-clamp-4 text-gray-700">
                  {items.fullTestimonial.slice(0, 150)}...
                </p>
                <div className="flex justify-start pt-4">
                  <button
                    className="text-custom-red font-medium"
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
