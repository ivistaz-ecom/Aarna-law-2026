"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { LanguageContext } from "../../app/context/LanguageContext";
import { mapEmbedUrlNetwork } from "@/utils/data";

function OurNetwork({
  embedUrl = mapEmbedUrlNetwork,
  showHeading = true,
  mapBarTitle = "Aarna Law — Our network",
  iframeTitle = "Aarna Law office network map",
  /** Contact page: same embed, framed with entrance animation + soft ongoing motion. */
  animatedPresentation = false,
}) {
  const { translations } = useContext(LanguageContext);
  const mapRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(false);

  // Show map when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const enableMapInteraction = () => {
    setMapInteractive(true);
  };

  const disableMapInteraction = () => {
    setMapInteractive(false);
  };

  const frameClass = animatedPresentation
    ? "relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl shadow-[0_20px_50px_-18px_rgba(28,56,106,0.45)] ring-1 ring-[#1C386A]/20 our-network-map-frame"
    : "w-full";
  const mapAreaClass =
    animatedPresentation && showMap
      ? "our-network-map-enter"
      : "";
  const ambientClass =
    animatedPresentation && showMap ? "our-network-map-ambient" : "";

  return (
    <>
      <style>
        {`
          .qqvbed-p83tee-V1ur5d {
            text-transform: capitalize !important;
          }
          @keyframes ourNetworkMapEnter {
            from {
              opacity: 0;
              transform: translateY(28px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .our-network-map-enter {
            animation: ourNetworkMapEnter 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes ourNetworkMapAmbient {
            0%, 100% { box-shadow: 0 20px 50px -18px rgba(28, 56, 106, 0.4); }
            50% { box-shadow: 0 24px 56px -14px rgba(238, 60, 35, 0.22); }
          }
          .our-network-map-frame.our-network-map-ambient {
            animation: ourNetworkMapAmbient 5s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .our-network-map-enter,
            .our-network-map-frame.our-network-map-ambient {
              animation: none !important;
              opacity: 1;
              transform: none;
              box-shadow: 0 20px 50px -18px rgba(28, 56, 106, 0.35);
            }
          }
        `}
      </style>

      <div className="container mx-auto px-4 md:px-0">
        {showHeading ? (
          <p className="pb-8 pt-12 text-center text-xl font-semibold text-custom-blue md:text-2xl">
            {translations.network.networkTitle}
          </p>
        ) : null}

        <div className={`bg-gray-800 py-1 text-white ${frameClass} ${ambientClass}`}>
          <p className="p-4 font-semibold">{mapBarTitle}</p>

          <div className={`relative w-full overflow-hidden ${mapAreaClass}`} ref={mapRef}>
            {showMap ? (
              <div
                className="relative h-[600px] w-full"
                onClick={enableMapInteraction}
                onMouseLeave={disableMapInteraction}
              >
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="600"
                  className="mt-[-61px] border-0"
                  title={iframeTitle}
                  loading="lazy"
                  style={{
                    pointerEvents: mapInteractive ? "auto" : "none",
                  }}
                />

                {!mapInteractive && (
                  <>
                    <div className="absolute inset-0 z-10 cursor-pointer bg-transparent" />
                    <div className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 rounded-md border bg-black/30 px-2 py-2 text-center text-sm text-white shadow-md md:px-4">
                      🖱️ Click to interact with map
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex h-[600px] w-full items-center justify-center bg-gray-300 text-gray-600">
                Loading map...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default OurNetwork;
