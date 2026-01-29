"use client";
import React, { useEffect, useState } from "react";
import Banner from "@/components/Insights/InsidePage/Banner";
import Link from "next/link";
import ErrorPage from "@/components/404/page";
import configData from "../../../config.json";
import Faq from "@/components/FAQ/Faq";

export default function Page({ params }) {
  const paramUrl = params.slug;
  const [title, setTitle] = useState(null);
  const [date, setDate] = useState(null);
  const [featureImage, setFeatureImage] = useState(null);
  const [content, setContent] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const domain = typeof window !== "undefined" ? window.location.hostname : "";
        let server;
        let productionModeFilter = "";

        if (
          domain === configData.LIVE_SITE_URL ||
          domain === configData.LIVE_SITE_URL_WWW
        ) {
          server = configData.LIVE_PRODUCTION_SERVER_ID;
          productionModeFilter = `&production_mode=${server}`;
        } else {
          server = configData.STAG_PRODUCTION_SERVER_ID;
          productionModeFilter = `&production_mode=${server}`;
        }

        const response = await fetch(
          `https://docs.aarnalaw.com/wp-json/wp/v2/posts?_embed&slug=${paramUrl}&status=publish${productionModeFilter}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const post = data[0];
          const allowedCategory = post.categories.includes(13) || post.categories.includes(14);

          if (!allowedCategory) {
            setError(true);
            return;
          }

          setTitle(post.title.rendered);
          setDate(post.date);
          setContent(post.content.rendered);

          // Feature image
          if (post.featured_media) {
            try {
              const mediaResponse = await fetch(
                `https://docs.aarnalaw.com/wp-json/wp/v2/media/${post.featured_media}`
              );
              const mediaResult = await mediaResponse.json();
              setFeatureImage(mediaResult.source_url || null);
            } catch (mediaErr) {
              console.error("Error fetching media:", mediaErr);
              setFeatureImage(null);
            }
          }

          // FAQs from ACF
          const acfData = post.acf || {};
          const newFaqs = [];
          for (let i = 1; i <= 10; i++) {
            const question = acfData[`faq_${i}`];
            const answer = acfData[`faqs_description_${i}`];
            if (question && answer) {
              newFaqs.push({ question, answer });
            }
          }
          setFaqs(newFaqs);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(true);
      }
    };

    fetchData();
  }, [paramUrl]);

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const monthAbbreviations = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${date.getDate()}\n${monthAbbreviations[date.getMonth()]}\n${date.getFullYear()}`;
  };

  if (error) {
    return <ErrorPage />;
  }

  if (!title || !content) return null;

  return (
    <>
      <style>{`
        .insight-blog ul {
          list-style-type: disc;
          margin-left: 30px;
        }
        .insight-blog ol {
          list-style-type: decimal;
          margin-left: 30px;
        }
        .insight-blog li {
          margin-bottom: 0px !important;
        }
        .insight-blog a {
          margin-bottom: 0px !important;
          padding-top: 0px !important;
        }
        p {
        padding-top: 5px !important;
        }
        h6{
         padding-top: 10px !important;
         padding-bottom: 0px !important;
        }
         li {
          padding-top: 0px !important;
          padding-bottom: 0px !important;
        }
        strong {
          padding-top: 0px !important;
        }
      `}</style>

      <div className="mx-auto container px-4 md-px">
        <div className="h-[200px]"></div>
        <h1
          className="py-4 md:text-4xl text-2xl font-bold tracking-wide text-black"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="py-4">Published: {formatDateString(date)}</p>
        <Banner backgroundImage={featureImage} />
      </div>

      <div className="pt-10">
        <div className="mx-auto container px-4 md-px">
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="insight-blog"
          />
        </div>
      </div>

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="container flex justify-start items-start mx-auto">
          <div className="text-left">
            <Faq faqs={faqs} className="text-left" />
          </div>
        </div>
      )}

      <div className="mx-auto container mt-8 px-4 md-px">
        <Link className="mt-6 bg-custom-red px-4 py-2 text-white" href="/insights/">
          Back to Insights
        </Link>
      </div>
    </>
  );
}
