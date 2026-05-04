// app/aarna-news/page.js

import NewsClient from "./NewsClient";
import config from "../../config.json";
import { headers } from "next/headers";

export const revalidate = 60;

export const metadata = {
  title: "Aarna Law News and Updates",
  description:
    "Stay updated with the latest news and developments from Aarna Law. Follow our journey and achievements in the legal landscape.",
  metadataBase: new URL("https://www.aarnalaw.com"),
  alternates: {
    canonical: "/aarna-news",
  },
  openGraph: {
    title: "Aarna Law News and Updates",
    description:
      "Stay updated with the latest news and developments from Aarna Law. Follow our journey and achievements in the legal landscape.",
    url: "https://www.aarnalaw.com/aarna-news",
    images: "/insights/NewsInsights.jpeg",
  },
};

// Utility to determine productionMode based on domain
function getProductionModeFromHost(hostname) {
  const normalizeHost = (value = "") => {
    const rawValue = value.trim();
    let parsedHost = rawValue;

    try {
      parsedHost = new URL(rawValue).hostname;
    } catch {
      parsedHost = rawValue.split(":")[0];
    }

    return parsedHost.replace(/^www\./, "").toLowerCase();
  };

  const currentHost = normalizeHost(hostname);
  const liveHost = normalizeHost(config.LIVE_SITE_URL);
  const stagingHost = normalizeHost(config.STAGING_SITE_URL);
  const isLiveDomain = currentHost === liveHost;
  const isStagingDomain = currentHost === stagingHost;

  if (isLiveDomain) return config.LIVE_PRODUCTION_SERVER_ID;
  if (isStagingDomain) return config.STAG_PRODUCTION_SERVER_ID;

  return config.STAG_PRODUCTION_SERVER_ID;
}

// Fetch initial news data
async function fetchInitialNews(productionMode) {
  if (!productionMode) return [];

  const url = `${config.SERVER_URL}posts?_embed&categories[]=9&status[]=publish&production_mode[]=${productionMode}&per_page=6`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    return await res.json();
  } catch (error) {
    console.error("News fetch error:", error);
    return [];
  }
}

export default async function AarnaNewsPage() {
  const headersList = headers();
  const hostname = headersList.get("host")?.replace(/^www\./, "") ?? "";
  const productionMode = getProductionModeFromHost(hostname);

  const initialData = await fetchInitialNews(productionMode);

  return <NewsClient initialData={initialData} />;
}
