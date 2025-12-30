import InsightsClient from "./InsightsClient";
import config from "../../config.json";
import { headers } from "next/headers";

export const revalidate = 60;

export const metadata = {
  title: "Legal Insights and Expertise",
  description: "Stay informed with the latest legal insights and expert analyses...",
  metadataBase: new URL("https://www.aarnalaw.com"),
  alternates: { canonical: "/insights" },
  openGraph: {
    title: "Legal Insights and Expertise",
    description: "Stay informed with the latest legal insights...",
    url: "https://www.aarnalaw.com/insights",
    images: "/insights/InsightsBanner.jpg",
  },
};

// Utility to determine productionMode based on domain
function getProductionModeFromHost(hostname) {
  if (!hostname) return config.STAG_PRODUCTION_SERVER_ID;

  // Clean the hostname by removing www. prefix and trailing slash
  const cleanHostname = hostname.replace(/^www\./, '').replace(/\/$/, '');

  const isLiveDomain =
    cleanHostname === config.LIVE_SITE_URL || cleanHostname === config.LIVE_SITE_URL_WWW;

  const isStagingDomain = cleanHostname === config.STAGING_SITE_URL;

  if (isLiveDomain) {
    return config.LIVE_PRODUCTION_SERVER_ID;
  } else if (isStagingDomain) {
    return config.STAG_PRODUCTION_SERVER_ID;
  } else {
    // Default to staging for development/localhost
    return config.STAG_PRODUCTION_SERVER_ID;
  }
}

// Fetch archive years
async function fetchArchives() {
  const res = await fetch(config.SERVER_URL + "archives", {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch archives: ${res.statusText}`);
  }

  const archives = await res.json();
  return archives.sort((a, b) => parseInt(b.name, 10) - parseInt(a.name, 10));
}

// Fetch insights based on year and productionMode
async function fetchInsights(year, productionMode, page = 1) {
  if (
    !productionMode ||
    (Array.isArray(productionMode) && productionMode.length === 0)
  ) {
    return []; // Return nothing if no productionMode is selected
  }

  const after = `${year}-01-01T00:00:00`;
  const before = `${year}-12-31T23:59:59`;

  // Handle array or single value for production_mode
  const productionModeParam = Array.isArray(productionMode)
    ? productionMode.map((mode) => `production_mode[]=${mode}`).join("&")
    : `production_mode[]=${productionMode}`;

  const url = `${config.SERVER_URL}posts?_embed&per_page=6&page=${page}&categories=12,13&after=${after}&before=${before}&status[]=publish&${productionModeParam}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch insights: ${res.statusText}`);
  }

  return await res.json();
}


// Main server component
export default async function AarnaInsightsPage() {
  const headersList = headers();
  const hostname = headersList.get("host")?.replace(/^www\./, "") ?? "";

  const productionMode = getProductionModeFromHost(hostname);

  const archives = await fetchArchives();
  const initialYear = archives[0]?.name || new Date().getFullYear().toString();
  const initialData = await fetchInsights(initialYear, productionMode);

  return (
    <InsightsClient
      initialData={initialData}
      initialArchives={archives}
      initialYear={initialYear}
      productionMode={productionMode}
    />
  );
}


