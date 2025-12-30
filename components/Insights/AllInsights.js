"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import config from "../../config.json";

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

function AllInsights({
  searchTerm,
  initialData = [],
  initialArchives = [],
  initialYear,
  productionMode,
}) {
  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [archives, setArchives] = useState(initialArchives);
  const [selectedArchive, setSelectedArchive] = useState(initialYear || (initialArchives[0]?.name ?? null));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isChangingArchive, setIsChangingArchive] = useState(false);

  const fetchData = async (year, pageNum = 1, append = false) => {
    // Determine production mode based on current domain (like AllNews.js)
    let server;
    // Extract hostname from config URLs for comparison
    const liveHostname = config.LIVE_SITE_URL.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const stagingHostname = config.STAGING_SITE_URL.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const currentHostname = domain.replace(/^www\./, '');

    if (currentHostname === liveHostname || domain === config.LIVE_SITE_URL_WWW) {
      server = config.LIVE_PRODUCTION_SERVER_ID;
    } else if (currentHostname === stagingHostname) {
      server = config.STAG_PRODUCTION_SERVER_ID;
    } else {
      server = config.STAG_PRODUCTION_SERVER_ID;
    }

    const cat1 = 12;
    const cat2 = 13;
    const after = `${year}-01-01T00:00:00`;
    const before = `${year}-12-31T23:59:59`;
    const url = `${config.SERVER_URL}posts?_embed&per_page=6&page=${pageNum}&categories=${cat1},${cat2}&after=${after}&before=${before}&status[]=publish&production_mode[]=${server}`;

    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (Array.isArray(result)) {
        const sortedData = result.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (append) {
          const newData = [...data, ...sortedData];
          setData(newData);
          filterData(newData, searchTerm);
        } else {
          if (year === selectedArchive) {
            setData(sortedData);
            filterData(sortedData, searchTerm);
          }
        }
        setHasMore(sortedData.length === 6);
      }
      setIsChangingArchive(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsChangingArchive(false);
    }
  };

  const filterData = (dataToFilter, term) => {
    if (!term) {
      setFilteredData(dataToFilter);
      setHasMore(dataToFilter.length >= 6);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = dataToFilter.filter(item => {
      const title = item.title.rendered.toLowerCase();
      const content = item.content.rendered.toLowerCase();
      const excerpt = item.excerpt.rendered.toLowerCase();
      return (
        title.includes(searchLower) ||
        content.includes(searchLower) ||
        excerpt.includes(searchLower)
      );
    });

    setFilteredData(filtered);
    setHasMore(filtered.length >= 6 && filtered.length === dataToFilter.length && dataToFilter.length === 6);
  };

  useEffect(() => {
    filterData(data, searchTerm);
  }, [searchTerm, data]);

  useEffect(() => {
    if (selectedArchive) {
      setIsChangingArchive(true);
      fetchData(selectedArchive, 1, false);
    }
  }, [selectedArchive]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchData(selectedArchive, nextPage, true);
    setIsLoadingMore(false);
  };

  const stripHTMLAndLimit = (htmlContent) => {
    const text = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");
    return text.length > 255 ? text.substring(0, 255) + "..." : text;
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const monthAbbreviations = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const day = date.getDate();
    const month = monthAbbreviations[date.getMonth()];
    const year = date.getFullYear();
    return `${day}\n${month}\n${year}`;
  };

  return (
    <div className="flex w-full flex-col md:flex-row container mx-auto pt-10 px-4 md:px-0">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-9/12">
        {filteredData.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 text-center py-8">
            {isChangingArchive ? (
              <LoadingDots />
            ) : (
              <p className="text-gray-500">No results found {searchTerm ? `for "${searchTerm}"` : ""}</p>
            )}
          </div>
        ) : (
          <>
            {filteredData.map((item) => (
              <div
                className="rounded-lg border border-gray-200 bg-white shadow transition-opacity duration-300"
                key={item.id}
              >
                <Image
                  src={item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/PracticeArea/Aarna-Law-Banner-img.png"}
                  alt={item.title.rendered}
                  className="h-[200px] w-full rounded-t-lg object-cover"
                  width={500}
                  height={300}
                  priority={true}
                />
                <div className="p-5">
                  <p
                    className="mb-2 line-clamp-2 min-h-14 text-lg font-bold tracking-tight text-gray-900"
                    dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                  />
                  <p
                    className="my-5 min-h-28 text-sm font-normal text-gray-700"
                    dangerouslySetInnerHTML={{ __html: stripHTMLAndLimit(item.excerpt.rendered) }}
                  />
                  <p className="pb-4 text-xs text-gray-500">
                    {formatDateString(item.date)}
                  </p>
                  <Link href={`/insights/${item.slug}`} className="text-red-500">
                    Read more
                  </Link>
                </div>
              </div>
            ))}
            {hasMore && filteredData.length >= 6 && (
              <div className="col-span-1 mt-6 text-center sm:col-span-2">
                {isLoadingMore ? (
                  <div className="inline-block px-4 py-2">
                    <LoadingDots />
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="bg-custom-red px-4 py-2 text-white hover:bg-red-600 active:bg-red-700"
                    disabled={isChangingArchive}
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-8 w-full bg-gray-50 p-4 pb-12 md:mt-0 md:w-3/12 md:p-4 lg:ml-8">
        <h2 className="font-bold">Archives</h2>
        <hr className="my-4 border-t-2 border-red-500" />
        <ul className="space-y-4 text-left text-gray-500">
          {archives.map((archive) => (
            <button
              onClick={() => {
                setSelectedArchive(archive.name);
                setPage(1);
              }}
              className={`flex w-full border-b border-red-500 p-1 ${selectedArchive === archive.name
                ? "font-bold text-red-500"
                : "hover:text-red-500"
                }`}
              key={archive.id}
              disabled={isChangingArchive}
            >
              <p dangerouslySetInnerHTML={{ __html: archive.name }} />
            </button>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AllInsights;
