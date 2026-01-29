"use client";
import React, { useEffect, useState } from "react";
import Banner from "@/components/Team/Banner";
import Link from "next/link";
import ErrorPage from "@/components/404/page";

export default function Page({ params }) {
  const paramUrl = params.slug;
  const [title, setTitle] = useState(null);
  const [date, setDate] = useState(null);
  const [featureImage, setFeatureImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [mobileBannerImage, setMobileBannerImage] = useState(null);
  const [content, setContent] = useState(null);
  const [designation, setDesignation] = useState(null);
  const [description, setDescription] = useState(null);
  const [practiceAreas, setPracticeAreas] = useState(null);
  const [error, setError] = useState(false); // Error state to handle error page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://docs.aarnalaw.com/wp-json/wp/v2/team?_embed&slug=${paramUrl}`,
        );
        const data = await response.json();
        // console.log("team data", data);
        if (data && data.length > 0) {
          const post = data[0];
          // Set post details in state
          // console.log("filter data", post);
          setTitle(post.title.rendered);
          setBannerImage(post.acf.banner_image.url);
          setMobileBannerImage(post.acf.mobile_banner.url);
          setDesignation(post.acf.designation);
          setPracticeAreas(post.acf.practice_areas);
          setDescription(post.acf.description);
          setDate(post.date);

          //Fetch the featured image if it exists
          if (post.featured_media) {
            try {
              const mediaResponse = await fetch(
                `https://docs.aarnalaw.com/wp-json/wp/v2/media/${post.featured_media}`,
              );
              const mediaResult = await mediaResponse.json();

              setFeatureImage(mediaResult.source_url || null);
            } catch (error) {
              console.error("Error fetching media for post:", error);
              setFeatureImage(null);
            }
          }
        } else {
          console.error("No post data found.");
          setError(true); // Set error state if no post found
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [paramUrl]);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <>
      <Banner
        title={title}
        backgroundImage={bannerImage}
        mobileBackgroundImage={mobileBannerImage}
        designation={designation}
      />
      <div className="mx-auto md:flex md:w-11/12 py-12 p-2">
        <div className="md:w-3/12 rounded-lg bg-gray-300 p-8">
          <h2 className="pb-4 font-semibold text-custom-red">PRACTICE AREAS</h2>
          <span dangerouslySetInnerHTML={{ __html: practiceAreas }}></span>
        </div>
        <div className=" md:w-9/12 md:p-8 p-4">
          <span
            dangerouslySetInnerHTML={{ __html: description }}
            className="team-content"
          ></span>
        </div>
      </div>
    </>
  );
}
