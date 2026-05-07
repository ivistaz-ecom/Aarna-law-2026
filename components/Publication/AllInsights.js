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
  const [redirecting, setRedirecting] = useState(false);

  const router = useRouter();

  const domain =
    typeof window !== "undefined" ? window.location.hostname : "";

  // CHECK FORM SUBMISSION BASED ON PUBLICATION URL
  const hasRecentPublicationSubmission = (publicationUrl) => {
    if (typeof window === "undefined") return false;

    const storedEmail = localStorage.getItem("publication_user_email");

    const publicationKey = `publication_form_submission_${publicationUrl}`;

    const lastSubmission = localStorage.getItem(publicationKey);

    if (!storedEmail || !lastSubmission) return false;

    const last = parseInt(lastSubmission, 10);

    if (Number.isNaN(last)) return false;

    return Date.now() - last < 90 * 24 * 60 * 60 * 1000;
  };

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
        `${configData.SERVER_URL}publications?_embed&status[]=publish&production_mode[]=${server}`
      );

      if (!publicationsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const publicationsData = await publicationsResponse.json();

      const sortedData = publicationsData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
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

    const monthAbbreviations = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    return (
      <div className="flex flex-row items-center gap-2 lg:flex-col lg:gap-0">
        <p className="text-2xl font-bold text-custom-red">
          {date.getDate()}
        </p>

        <p className="font-bold">
          {monthAbbreviations[date.getMonth()]}
        </p>

        <p className="font-bold">{date.getFullYear()}</p>
      </div>
    );
  };

  const stripHTMLAndLimit = (htmlContent) => {
    const text = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");

    return text.length > 180
      ? text.substring(0, 180) + "..."
      : text;
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
      item.title.rendered
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .slice(0, page);

  // FORM SUBMIT
  const handleFormSubmit = async () => {
    try {
      setRedirecting(true);

      if (
        selectedItem &&
        selectedItem.acf &&
        selectedItem.acf.publication_url
      ) {
        // SAVE FOR PARTICULAR PUBLICATION
        localStorage.setItem(
          `publication_form_submission_${selectedItem.acf.publication_url}`,
          Date.now().toString()
        );

        // SMALL DELAY FOR BUTTON UPDATE
        setTimeout(() => {
          window.location.replace(
            selectedItem.acf.publication_url
          );
        }, 300);

        return;
      }

      if (selectedItem && selectedItem.slug) {
        router.push(`/publications/${selectedItem.slug}`);
      }
    } catch (error) {
      console.error("Redirect Error:", error);
      setRedirecting(false);
    }
  };

  const handleCloseForm = () => {
    if (redirecting) return;

    setShowForm(false);
    setSelectedItem(null);
  };

  return (
    <div className="mx-auto container grid gap-4 px-4 py-12 md:px-0 lg:grid-cols-2">
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
                dangerouslySetInnerHTML={{
                  __html: item.title.rendered,
                }}
              />

              <p
                className="mb-3 min-h-20 font-normal text-gray-700 dark:text-gray-400"
                dangerouslySetInnerHTML={{
                  __html: stripHTMLAndLimit(
                    item.content.rendered
                  ),
                }}
              />

              {item.acf.publication_url ===
                "https://publications.aarnalaw.com/" ||
              item.acf.publication_url ===
                "https://publications2.aarnalaw.com/art-law-2026" ? (
                <Link
                  href="#"
                  className="font-semibold text-custom-red"
                  onClick={(e) => {
                    e.preventDefault();

                    if (
                      hasRecentPublicationSubmission(
                        item.acf.publication_url
                      )
                    ) {
                      window.location.replace(
                        item.acf.publication_url
                      );
                      return;
                    }

                    setRedirecting(false);
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
            className="border border-custom-red px-6 py-2 text-custom-red md:px-4 md:py-1.5 md:text-sm md:hover:bg-custom-red md:hover:text-white lg:px-6 lg:py-2 lg:text-base"
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

      <Modal
        show={showForm}
        onClose={handleCloseForm}
        position="center"
      >
        <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700 md:w-[700px]">
          <div className="flex items-center justify-between border-b px-6 pb-2 pt-6 dark:border-gray-600">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              Enter Your Details
            </div>

            <button
              onClick={handleCloseForm}
              disabled={redirecting}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
              aria-label="Close popup"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <div
            className="overflow-y-auto p-6"
            style={{ flex: "1 1 auto" }}
          >
            <PublicationPopupForm
              onSubmit={handleFormSubmit}
              onClose={handleCloseForm}
              item={selectedItem}
              embedded={true}
              redirecting={redirecting}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AllInsights;