"use client";

import React, { useRef, useState } from "react";
import { play } from "@/utils/icons";

const VideoPlayer = ({ src, poster, posterMobile, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!src) return null;

  const handlePlayClick = () => {
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
        {/* Cover image - desktop vs mobile */}
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
