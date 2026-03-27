import React from "react";
import Head from "next/head";
import Banner from "../../components/Testimonials/Banner";
import TestimonialContent from "../../components/Testimonials/TestimonialContent";

const Testimonials = () => {
  return (
    <>
      {/* <Head>
        <title>Testimonials - Aarna Law</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="This page is not for public indexing." />
      </Head> */}
      <Banner />
      <TestimonialContent />
    </>
  );
};

export default Testimonials;
