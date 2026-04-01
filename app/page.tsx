import dynamic from "next/dynamic";
import configData from "../config.json";

type Insight = {
  id: number;
  imageUrl: string;
  title: string;
  desc: string;
  slug: string;
};

// Dynamically import all homepage components
const Banner = dynamic(() => import("../components/HomePage/Banner"), {
  ssr: true,
  loading: () => <div className="h-[70vh] w-full animate-pulse bg-gray-100" />,
});

const HomeInsights = dynamic(
  () => import("@/components/HomePage/HomeInsights"),
  {
    ssr: true,
    loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
  },
);

const WhatWeDo = dynamic(() => import("../components/HomePage/WhatWeDo"), {
  ssr: true,
});
const KindOfDispute = dynamic(
  () => import("../components/HomePage/KindOfDisputesWeDo"),
  {
    ssr: false,
  },
);

const Testimonials = dynamic(
  () => import("../components/HomePage/Testimonials"),
  {
    ssr: false,
  },
);
const TrackRecords = dynamic(
  () => import("../components/HomePage/Trackrecords"),
  {
    ssr: false,
  },
);
const OurCredentials = dynamic(
  () => import("../components/HomePage/OurCredentials"),
  {
    ssr: false,
  },
);
const ContactUsSection = dynamic(
  () => import("@/components/ContactUs/ContactUsSection"),
  { ssr: false },
);

const OurLocations = dynamic(() => import("@/components/ContactUs/Address"), {
  ssr: false,
});

export const metadata = {
  title:
    "Aarna Law | Litigation, Dispute Resolution & Corporate Law Practice in India",
  description:
    "Discover legal services in India. Aarna Law offers full-service representation with dedication.",
  alternates: {
    metadataBase: new URL("https://www.aarnalaw.com"),
    canonical: "https://www.aarnalaw.com/",
  },
  openGraph: {
    title:
      "Aarna Law | Litigation, Dispute Resolution & Corporate Law Practice in India",
    description:
      "Discover legal services in India. Aarna Law offers full-service representation with dedication.",
    url: "https://www.aarnalaw.com/",
    images: "/banner/desktop_home_banner_2.jpg",
  },
};

interface InsightPost {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

// async function getInsights() {
//   try {
//     const domain =
//       process.env.NODE_ENV === 'production'
//         ? configData.LIVE_SITE_URL
//         : configData.STAGING_SITE_URL;

//     const server =
//       domain === configData.LIVE_SITE_URL
//         ? configData.LIVE_PRODUCTION_SERVER_ID
//         : configData.STAG_PRODUCTION_SERVER_ID;

//     const page = 8;
//     const insightsResponse = await fetch(
//       `${configData.SERVER_URL}posts?_embed&categories[]=13&status[]=publish&production_mode[]=${server}&per_page=${page}`,
//       { cache: 'no-store' }
//     );

//     if (!insightsResponse.ok) {
//       throw new Error('Failed to fetch insights');
//     }

//     const posts: InsightPost[] = await insightsResponse.json();

//     return posts
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//       .slice(0, 6)
//       .map((item) => ({
//         id: item.id,
//         imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
//         title: item.title.rendered,
//         desc: item.excerpt.rendered,
//         slug: item.slug,
//       }));
//   } catch (error) {
//     console.error('Error fetching insights:', error);
//     return [];
//   }
// }

export default async function Home() {
  // const initialInsights = await getInsights();

  return (
    <>
      <Banner />
      <HomeInsights />
      <WhatWeDo />
      <KindOfDispute />
      <Testimonials />
      <TrackRecords />
      <OurCredentials />

      <OurLocations />
      <ContactUsSection />
    </>
  );
}
