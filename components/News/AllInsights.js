"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { initFlowbite } from "flowbite";
import debounce from "lodash.debounce";
import configData from "../../config.json";

const domain = typeof window !== "undefined" ? window.location.hostname : "";

function LoadingDots() {
  return (
    <div className="inline-flex items-center text-black">
      Loading
      <span className="loading-dots">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>
      <style jsx>{`
        .loading-dots {
          display: inline-flex;
        }
        .dot {
          animation: dotFade 1.4s infinite;
          opacity: 0;
          margin-left: 2px;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dotFade {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function AllNews({ searchTerm, initialData = [] }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchContent = async (pageNum = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let server;
      if (domain === `${configData.LIVE_SITE_URL}`) {
        server = `${configData.LIVE_PRODUCTION_SERVER_ID}`;
      } else if (domain === `${configData.STAGING_SITE_URL}`) {
        server = `${configData.STAG_PRODUCTION_SERVER_ID}`;
      } else {
        server = `${configData.STAG_PRODUCTION_SERVER_ID}`;
      }

      const response = await fetch(
        `${configData.SERVER_URL}posts?_embed&categories[]=9&status[]=publish&production_mode[]=${server}&per_page=6&page=${pageNum}`
      );
      const newsData = await response.json();

      if (Array.isArray(newsData)) {
        const sortedData = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (append) {
          const newData = [...data, ...sortedData];
          setData(newData);
        } else {
          setData(sortedData);
        }
        setHasMore(sortedData.length === 6);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMore(false);
    }

    if (append) {
      setIsLoadingMore(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      initFlowbite();
    }
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchContent(nextPage, true);
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const monthAbbreviations = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const day = date.getDate();
    const month = monthAbbreviations[date.getMonth()];
    const year = date.getFullYear();
    return `${day}\n${month}\n${year}`;
  };

  const stripHTMLAndLimit = (htmlContent) => {
    const text = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");
    return text.length > 300 ? text.substring(0, 300) + "..." : text;
  };

  const filteredInsights = data.filter((data) =>
    data.title.rendered.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 md:p-8 lg:p-12">
      <div className="mx-auto container grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:p-0">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((items) => (
            <div
              className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800"
              key={items.id}
            >
              <Image
                src={items._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/PracticeArea/Aarna-Law-Banner-img.png"}
                alt={items.title.rendered}
                className="h-[200px] w-full md:h-[300px] object-cover"
                width={500}
                height={300}
                priority={true}
              />
              <div className="p-5">
                <p
                  className="mb-2 min-h-20 text-lg font-bold tracking-tight text-gray-900 dark:text-white md:text-xl"
                  dangerouslySetInnerHTML={{ __html: items.title.rendered }}
                ></p>

                <p
                  className="mb-3 min-h-28 text-sm font-normal text-gray-700 dark:text-gray-400 md:h-20"
                  dangerouslySetInnerHTML={{
                    __html: stripHTMLAndLimit(items.excerpt.rendered),
                  }}
                ></p>
                <p className="pb-4 text-xs text-gray-500 md:text-sm">
                  {formatDateString(items.date)}
                </p>
                <Link
                  href={`/aarna-news/${items.slug}`}
                  className="font-semibold text-custom-red"
                >
                  Read more
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 mt-4 text-center text-gray-500 md:col-span-2">
            No related post found
          </div>
        )}

        {/* Load More Button */}
        {hasMore && filteredInsights.length >= 6 && (
          <div className="col-span-1 mt-6 text-center sm:col-span-2">
            {isLoadingMore ? (
              <div className="inline-block px-4 py-2">
                <LoadingDots />
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="border border-custom-red px-6 py-2 text-custom-red md:hover:bg-custom-red md:hover:text-white md:px-4 md:py-1.5 md:text-sm lg:px-6 lg:py-2 lg:text-base"
                disabled={isLoadingMore}
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllNews;
