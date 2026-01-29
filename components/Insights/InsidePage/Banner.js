import React from "react";
import Image from "next/image";

export default function Banner({ title, backgroundImage }) {
  if (!backgroundImage) return null;

  const getAltText = (url) => {
    return url
      .split("/")
      .pop()
      .split(".")[0]
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const altText = title || getAltText(backgroundImage);

  return (
    <figure>
      <Image
        src={backgroundImage}
        width={600}
        height={600}
        className="w-full"
        alt={altText}
        loading="lazy"
      />
    </figure>
  );
}
