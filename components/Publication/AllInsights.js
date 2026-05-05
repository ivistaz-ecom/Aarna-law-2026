"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import configData from "../../config.json";
import PublicationPopupForm from "../../utils/Forms/PublicationForms/PublicationPopupForm";
import { useRouter } from "next/navigation";
import { Modal } from "flowbite-react";
import { HiX } from "react-icons/hi";

function AllInsights({ searchTerm, initialData = [] }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(6);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const router = useRouter();

  const domain = typeof window !== "undefined" ? window.location.hostname : "";

  const fetchContent = useCallback(async () => {
    if (!data.length) return;
    setLoading(true);
    setError(null);

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

      const publicationsResponse = await fetch(
        `${configData.SERVER_URL}publications?_embed&status[]=publish&production_mode[]=${server}`,
      );

      if (!publicationsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const publicationsData = await publicationsResponse.json();
      const sortedData = publicationsData.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      setData(sortedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setError("Something went wrong. Please try again later.");
    }
  }, [domain, data.length]);

  useEffect(() => {
    if (data.length === 0) {
      fetchContent();
    }
  }, [fetchContent, data.length]);

  const loadMore = () => {
    if (data.length > page) {
      setPage((prevPage) => prevPage + 6);
    }
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const monthAbbreviations = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];
    return (
      <div className="flex flex-row items-center gap-2 lg:flex-col lg:gap-0">
        <p className="text-2xl font-bold text-custom-red">{date.getDate()}</p>
        <p className="font-bold">{monthAbbreviations[date.getMonth()]}</p>
        <p className="font-bold">{date.getFullYear()}</p>
      </div>
    );
  };

  const stripHTMLAndLimit = (htmlContent) => {
    const text = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");
    return text.length > 180 ? text.substring(0, 180) + "..." : text;
  };

  const SkeletonLoader = () => (
    <div className="flex animate-pulse border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-[200px] w-full items-center justify-center bg-gray-300 p-5">
        <div className="mb-2 h-4 w-1/4 rounded bg-gray-400" />
        <div className="h-4 w-1/4 rounded bg-gray-400" />
      </div>
      <div>
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-400" />
        <div className="h-4 w-full rounded bg-gray-400" />
      </div>
    </div>
  );

  const filteredInsights = data
    .filter((item) =>
      item.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(0, page);

  const handleFormSubmit = (formData) => {
    if (selectedItem && selectedItem.acf && selectedItem.acf.publication_url) {
      window.location.href = selectedItem.acf.publication_url;
    } else if (selectedItem && selectedItem.slug) {
      router.push(`/publications/${selectedItem.slug}`);
    } else {
      console.error("Item is undefined or missing necessary properties");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedItem(null);
  };

  return (
    <div className="mx-auto container grid px-4 md:px-0 gap-4 md: py-12 lg:grid-cols-2">
      {loading && filteredInsights.length === 0 ? (
        Array.from({ length: 6 }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))
      ) : error ? (
        <div className="col-span-1 mt-4 text-center text-red-500 md:col-span-2">
          {error}
        </div>
      ) : filteredInsights.length > 0 ? (
        filteredInsights.map((item, index) => (
          <div
            className="flex flex-col border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800 sm:flex-row"
            key={index}
          >
            <div className="flex items-center justify-center bg-gray-300 p-5">
              {formatDateString(item.date)}
            </div>
            <div className="p-5">
              <p
                className="mb-2 line-clamp-2 min-h-14 text-xl font-medium tracking-tight text-gray-900 dark:text-white sm:text-xl"
                dangerouslySetInnerHTML={{ __html: item.title.rendered }}
              />
              <p
                className="mb-3 min-h-20 font-normal text-gray-700 dark:text-gray-400"
                dangerouslySetInnerHTML={{
                  __html: stripHTMLAndLimit(item.content.rendered),
                }}
              ></p>
              {item.acf.publication_url ? (
                <Link
                  href="#"
                  className="font-semibold text-custom-red"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForm(true);
                    setSelectedItem(item);
                  }}
                >
                  Read more
                </Link>
              ) : (
                <Link
                  href={`/publications/${item.slug}`}
                  className="font-semibold text-custom-red"
                >
                  Read more
                </Link>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-1 mt-4 text-center text-gray-500 md:col-span-2">
          No related post found
        </div>
      )}

      {!loading && data.length > page && (
        <div className="col-span-1 mt-6 flex justify-center md:col-span-2">
          <button
            onClick={loadMore}
            className="border border-custom-red px-6 py-2 text-custom-red md:hover:bg-custom-red md:hover:text-white md:px-4 md:py-1.5 md:text-sm lg:px-6 lg:py-2 lg:text-base"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && data.length <= page && (
        <div className="col-span-1 mt-4 text-center text-gray-500 md:col-span-2">
          No more details available
        </div>
      )}

      <Modal show={showForm} onClose={handleCloseForm} position="center">
        <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700 md:w-[700px]">
          <div className="flex items-center justify-between border-b px-6 pb-2 pt-6 dark:border-gray-600">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              Enter Your Details
            </div>
            <button
              onClick={handleCloseForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              aria-label="Close popup"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>
          <div className="overflow-y-auto p-6" style={{ flex: "1 1 auto" }}>
            <PublicationPopupForm
              onSubmit={handleFormSubmit}
              onClose={handleCloseForm}
              item={selectedItem}
              embedded={true}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AllInsights;
