"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import configData from "../../config.json";

function AllPodCasts({ searchTerm, initialData = [] }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const PER_PAGE = 6; // 👈 show 6 per page

  const domain = typeof window !== "undefined" ? window.location.hostname : "";

  const fetchContent = async (pageNum = 1, append = false) => {
    if (append) setIsLoadingMore(true);
    else setLoading(true);

    try {
      let server;
      if (
        domain === `${configData.LIVE_SITE_URL}` ||
        domain === `${configData.LIVE_SITE_URL_WWW}`
      ) {
        server = `${configData.LIVE_PRODUCTION_SERVER_ID}`;
      } else if (domain === `${configData.STAGING_SITE_URL}`) {
        server = `${configData.STAG_PRODUCTION_SERVER_ID}`;
      } else {
        server = `${configData.STAG_PRODUCTION_SERVER_ID}`;
      }

      const response = await fetch(
        `${configData.SERVER_URL}podcast?_embed&status[]=publish&production_mode[]=${server}&per_page=${PER_PAGE}&page=${pageNum}`,
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      console.log(result);

      if (Array.isArray(result)) {
        const transformedData = result.map((item) => ({
          ...item,
          featured_image_url: item.episode_featured_image || "",
        }));

        if (append) {
          setData((prev) => [...prev, ...transformedData]);
        } else {
          setData(transformedData);
        }

        // ✅ if less than PER_PAGE, no more to load
        setHasMore(result.length === PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchContent(1);
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchContent(nextPage, true);
  };

  const filteredInsights = data.filter((d) =>
    d.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col md:pt-10">
      <div className="container mx-auto grid w-full gap-4 p-4 md:grid-cols-2 md:p-0">
        {loading && page === 1 ? (
          <div className="col-span-2 text-center text-gray-500">Loading...</div>
        ) : filteredInsights.length > 0 ? (
          filteredInsights.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative">
                {item.featured_image_url && (
                  <Image
                    src={item.featured_image_url}
                    alt={item.title?.rendered || "Podcast Image"}
                    className="h-[350px] w-full rounded-t-lg object-cover"
                    width={500}
                    height={300}
                  />
                )}
              </div>
              <div className="p-5">
                <p
                  className="mb-2 line-clamp-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
                  dangerouslySetInnerHTML={{ __html: item.title?.rendered }}
                />
                <p
                  className="text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{
                    __html: item.excerpt.rendered.slice(0, 100) + "...",
                  }}
                />
                <Link
                  href={`/podcasts/${item.slug}`}
                  className="mt-3 inline-block rounded py-2 font-semibold text-[#E6331C]"
                >
                  Listen Now
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 mt-4 text-center text-gray-500 md:col-span-2">
            No related post found
          </div>
        )}

        {hasMore && (
          <div className="col-span-1 mt-6 text-center sm:col-span-2">
            {isLoadingMore ? (
              <div className="inline-block px-4 py-2">Loading...</div>
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

export default AllPodCasts;
