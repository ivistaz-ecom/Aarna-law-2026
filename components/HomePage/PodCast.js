"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import InsightSlider from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { leftArrow, rightArrow, pause, play } from "../../utils/icons";
import Image from "next/image";

const SkeletonLoader = () => (
  <div className="flex animate-pulse border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-800">
    <div className="h-40 w-40 flex-shrink-0 bg-gray-300"></div>
    <div className="ml-4 flex flex-col justify-between w-full">
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-400"></div>
      <div className="h-4 w-full rounded bg-gray-400"></div>
      <div className="mt-4 h-10 w-20 rounded bg-gray-400"></div>
    </div>
  </div>
);

const Podcasts = () => {
  const sliderRef = useRef(null);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const audioRefs = useRef({});

  const handlePlayPause = (id) => {
    if (currentPlayingId === id) {
      audioRefs.current[id].pause();
      setAutoPlay(true);
      setCurrentPlayingId(null);
    } else {
      if (currentPlayingId !== null && audioRefs.current[currentPlayingId]) {
        audioRefs.current[currentPlayingId].pause();
      }
      audioRefs.current[id].play();
      setAutoPlay(false);
      setCurrentPlayingId(id);
    }
  };

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch(
          "https://docs.aarnalaw.com/wp-json/wp/v2/podcast"
        );
        const data = await response.json();

        setPodcasts(
          data.map((podcast) => ({
            ...podcast,
            formattedDate: formatDate(podcast.date),
            imageUrl: podcast.episode_player_image,
          }))
        );
        setLoading(false);
      } catch (error) {
        // console.log(error);
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 2,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <div className="mx-auto w-11/12 py-12 lg:p-10 lg:py-12">
      <p className="mb-8 text-center text-2xl font-semibold text-custom-blue">
        Podcasts
      </p>

     
      {loading ? (
        // Render only 2 skeleton loaders
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <div>
          <InsightSlider
            ref={sliderRef}
            responsive={responsive}
            showDots={false}
            infinite={true}
            autoPlaySpeed={5000}
            autoPlay={autoPlay}
            itemClass="p-1"
            keyBoardControl={true}
            removeArrowOnDeviceType={["tablet", "mobile", "desktop"]}
          >
            {podcasts.slice(0, 4).map((item) => (
              <div
                className={`${
                  currentPlayingId === item.id
                    ? "border-custom-red"
                    : "border-gray-200"
                } gap-4 border bg-white lg:flex  lg:h-[236px]`}
                key={item.id}
              >
                <div className="flex flex-col gap-4 md:w-full lg:flex-row">
                  <Image
                    src={item.imageUrl}
                    width={201}
                    height={150}
                    alt="Podcast Thumbnail"
                    className="h-auto w-full lg:h-[236px] lg:w-[400px]"
                     loading="lazy"
                  />
                  <div className="w-full flex-col p-8 lg:p-10">
                    <p
                      className="mb-4 mt-4 w-full text-lg font-semibold text-custom-blue transition-colors duration-300 md:line-clamp-3 md:h-[100px] md:text-start md:text-2xl md:group-hover:text-white"
                      dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                    />
                    <div className="flex flex-row items-center justify-between">
                      <button
                        className="flex size-10 items-center justify-center rounded-full bg-custom-blue text-white transition-colors duration-300 md:group-hover:bg-custom-red"
                        onClick={() => handlePlayPause(item.id)}
                      >
                        {currentPlayingId === item.id ? pause : play}
                      </button>
                    </div>
                    <audio
                      ref={(el) => (audioRefs.current[item.id] = el)}
                      src={item.player_link}
                      className="hidden md:block"
                    />
                  </div>
                </div>
              </div>
            ))}
          </InsightSlider>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href="/podcasts"
          className="border border-custom-blue px-6 py-2 text-custom-blue md:hover:bg-custom-blue md:hover:text-white"
        >
          View All
        </Link>
      </div>
    </div>
  );
};

export default Podcasts;
