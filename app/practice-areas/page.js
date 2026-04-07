// app/practice-area/page.js

import Banner from "@/components/PracticeArea/Banner";
import PracticeLists from "@/components/PracticeArea/PracticeLists";
import config from "@/config.json";
import { headers } from "next/headers";

export const revalidate = 60;

export const metadata = {
  title: "Experienced Legal Services| Aarna Law Practice Areas",
  description:
    "Our dynamic team provides experienced counsel on a diverse range of practice areas",
  metadataBase: new URL("https://www.aarnalaw.com"),
  alternates: {
    canonical: "/practice-area",
  },
  openGraph: {
    title: "Experienced Legal Services| Aarna Law Practice Areas",
    description:
      "Our dynamic team provides experienced counsel on a diverse range of practice areas",
    url: "https://www.aarnalaw.com/practice-area",
    images: "/PracticeArea/PracticeAreas.png",
  },
};

// Utility to determine productionMode based on domain
function getProductionModeFromHost(hostname) {
  const isLiveDomain =
    hostname === config.LIVE_SITE_URL || hostname === config.LIVE_SITE_URL_WWW;

  return isLiveDomain
    ? config.LIVE_PRODUCTION_SERVER_ID
    : config.STAG_PRODUCTION_SERVER_ID;
}

// Fetch practice areas based on production mode
async function getPracticeAreas(productionMode, page = 1, perPage = 13) {
  if (!productionMode) return [];

  const url = `${config.SERVER_URL}practice-areas?status[]=publish&production_mode[]=${productionMode}&per_page=${perPage}&page=${page}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    const data = await res.json();

    return data.sort((a, b) =>
      a.title.rendered.localeCompare(b.title.rendered)
    );
  } catch (error) {
    console.error("Practice Areas fetch error:", error);
    return [];
  }
}

// Main server component
export default async function PracticeAreaPage() {
  const headersList = headers();
  const hostname = headersList.get("host")?.replace(/^www\./, "") ?? "";
  const productionMode = getProductionModeFromHost(hostname);

  const practiceAreas = await getPracticeAreas(productionMode, 1, 13);

  return (
    <>
      <Banner />
      <PracticeLists data={practiceAreas} loading={false} />
    </>
  );
}
