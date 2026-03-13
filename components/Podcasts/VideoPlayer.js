"use client";

import React from "react";

const VideoPlayer = ({ src, poster, title }) => {
  if (!src) return null;

  return (
    <div className="my-6">
      <video
        className="h-auto w-full max-h-[600px] rounded-lg bg-black"
        controls
        poster={poster || undefined}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {title && (
        <p className="mt-2 text-sm text-gray-600">
          {title}
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;

