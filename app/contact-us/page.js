import React from "react";
import Banner from "@/components/ContactUs/Banner";
import Address from "@/components/ContactUs/Address";
import ContactUsSection from "@/components/ContactUs/ContactUsSection";

export const metadata = {
  title: "Get in Touch with Aarna Law | Boutique Law Firm",
  description:
    "Contact us, a Bangalore-based law firm, for legal assistance and guidance.",
  metadataBase: new URL("https://www.aarnalaw.com"),
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "Get in Touch with Aarna Law | Boutique Law Firm",
    description:
      "Contact us, a Bangalore-based law firm, for legal assistance and guidance.",
    url: "/contact-us",
    images: "/contactUs/ContactBanner.jpg",
  },
};

function page() {
  return (
    <>
      <Banner />
      <ContactUsSection />
      <Address variant="contact" />
    </>
  );
}

export default page;
