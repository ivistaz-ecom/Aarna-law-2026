"use client";

import React from "react";
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa6";
import { phone as phoneIcon } from "@/utils/icons";
import { contactUsPrimary } from "@/utils/data";
import ZohoContactForm from "./ZohoContactForm";

/**
 * Contact Us: primary email & phone + enquiry form (separate from Our Locations).
 */
export default function ContactUsSection() {
  const telHref = contactUsPrimary.phone.replace(/\s+/g, "");

  return (
    <section
      className="bg-[#F5F5F5] py-12 md:py-16"
      id="contact-us"
      aria-labelledby="contact-us-heading"
    >
      <div className="container mx-auto px-4 md:px-0">
        <h2
          id="contact-us-heading"
          className="mb-4 border-b-2 border-custom-blue pb-[15px] text-left text-[26px] font-semibold leading-normal tracking-[1.6px] text-custom-red"
        >
          Contact Us
        </h2>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="order-2 space-y-6 lg:order-1 lg:col-span-4">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <p className="mb-4 text-lg font-semibold text-custom-blue">
                Get in Touch
              </p>
              <div className="flex items-start gap-3">
                <span className="mt-1 shrink-0 text-[#1C386A]" aria-hidden>
                  <FaEnvelope size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <Link
                    href={`mailto:${contactUsPrimary.email}`}
                    className="text-[#1C386A] underline-offset-2 hover:underline"
                  >
                    {contactUsPrimary.email}
                  </Link>
                </div>
              </div>
              <div className="mt-5 flex items-start gap-3">
                <span className="mt-1 shrink-0 text-[#1C386A]" aria-hidden>
                  {phoneIcon}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <a
                    href={`tel:${telHref}`}
                    className="text-[#1C386A] underline-offset-2 hover:underline"
                  >
                    {contactUsPrimary.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-8">
            <ZohoContactForm embedded showHeading={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
