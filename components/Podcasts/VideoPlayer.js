"use client";

import React, { useRef, useState } from "react";
import { play } from "@/utils/icons";
import { getYoutubeEmbedUrl } from "@/utils/youtube";

const VideoPlayer = ({ src, poster, posterMobile, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeActive, setYoutubeActive] = useState(false);

  if (!src) return null;

  const youtubeEmbedUrl = getYoutubeEmbedUrl(src);

  const handlePlayClick = () => {
    if (youtubeEmbedUrl) {
      setYoutubeActive(true);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  if (youtubeEmbedUrl) {
    return (
      <div className="my-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {youtubeActive ? (
            <iframe
              src={`${youtubeEmbedUrl}?autoplay=1`}
              title={title || "YouTube video player"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div
              className="relative h-full w-full min-h-[150px] cursor-pointer"
              onClick={handlePlayClick}
              onKeyDown={(e) => e.key === "Enter" && handlePlayClick()}
              role="button"
              tabIndex={0}
              aria-label="Play YouTube video"
            >
              {poster && (
                <img
                  src="/podcast/cover_img-video.png"
                  alt="Video cover"
                  className="absolute inset-0 hidden h-full w-full object-cover md:block"
                />
              )}
              {posterMobile && (
                <img
                  src="/podcast/podcast-img-mob.png"
                  alt="Video cover"
                  className="absolute inset-0 h-full w-full object-cover md:hidden"
                />
              )}
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
                aria-hidden
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-3xl text-[#E6331C] shadow-lg">
                  {play}
                </span>
              </div>
            </div>
          )}
        </div>
        {title && <p className="mt-2 text-sm text-gray-600">{title}</p>}
      </div>
    );
  }

  return (
    <div className="my-6">
      <div
        className="relative min-h-[150px] cursor-pointer overflow-hidden rounded-lg bg-black"
        onClick={handlePlayClick}
        onKeyDown={(e) => e.key === "Enter" && handlePlayClick()}
        role="button"
        tabIndex={0}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {!isPlaying && (
          <>
            {poster && (
              <img
                src="/podcast/cover_img-video.png"
                alt="Video cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {posterMobile && (
              <img
                src="/podcast/podcast-img-mob.png"
                alt="Video cover"
                className="absolute inset-0 h-full w-full object-cover md:hidden"
              />
            )}
          </>
        )}
        <video
          ref={videoRef}
          className="h-auto max-h-[600px] w-full rounded-lg"
          controls
          poster={poster || undefined}
          preload="none"
          onClick={(e) => e.stopPropagation()}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <div
            className="absolute inset-0 hidden items-center justify-center rounded-lg bg-black/30 transition hover:bg-black/40 md:flex"
            aria-hidden
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-3xl text-[#E6331C] shadow-lg">
              {play}
            </span>
          </div>
        )}
      </div>
      {title && <p className="mt-2 text-sm text-gray-600">{title}</p>}
    </div>
  );
};

export default VideoPlayer;
