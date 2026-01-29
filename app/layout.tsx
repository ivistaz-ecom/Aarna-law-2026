import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import Header from "../components/Header/NavBar";
import Footer from "../components/Footer/Footer";
import Script from "next/script";
import { headers } from "next/headers";
import { LanguageProvider } from "../app/context/LanguageContext";
import dynamic from "next/dynamic";
import ClarityInit from "../components/MicrosoftClarity/Microsoft";

const DisclaimerModal = dynamic(
  () => import("../components/DisclaimerModel/DisclaimerModal"),
  {
    ssr: false,
  },
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const isStaging = host.includes("website.aarnalaw.com");

  return (
    <html lang="en">
      <head>
        <meta
          name="robots"
          content={isStaging ? "noindex, nofollow" : "index, follow"}
        />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <ThemeModeScript />
        <meta name="msvalidate.01" content="A827D56A91561DA21E2E94273F4D52D5" />
      </head>
      <body>
        <LanguageProvider>
          <DisclaimerModal />
          <Header />
          {children}
          <Footer />
        </LanguageProvider>

        {/* ✅ Pretty-formatted JSON-LD for Schema */}
        <script
          id="legal-service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Aarna Law",
  "url": "https://aarnalaw.com/",
  "logo": "https://aarnalaw.com/logo/aarna-logo.png",
  "image": "https://aarnalaw.com/whatWeDo/What_we_do.jpg",
  "description": "Aarna Law is a leading Indian law firm specializing in arbitration, litigation, and corporate advisory services with a global perspective.",
  "telephone": "+91-8023566792",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "No.5, Adhokshaja, 2nd Main Rd, Vyalikaval, Guttahalli, Bengaluru, Karnataka 560003",
    "addressLocality": "BENGALURU",
    "addressRegion": "Karnataka",
    "postalCode": "560003",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://www.linkedin.com/company/aarna-law1/"
  ],
  "areaServed": "India",
  "priceRange": "$$",
  "founder": [
    {
      "@type": "Person",
      "name": "Shreyas Jayasimha"
    },
    {
      "@type": "Person",
      "name": "Kamala Naganand"
    }
  ],
  "employee": [
    {
      "@type": "Person",
      "name": "Meghna Talwar",
      "jobTitle": "Partner - Litigation and Securities Law"
    },
    {
      "@type": "Person",
      "name": "Spandana Ashwath",
      "jobTitle": "Partner"
    },
    {
      "@type": "Person",
      "name": "Apoorva Guruprasad",
      "jobTitle": "Partner"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "9",
    "bestRating": "5"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Naveen Reddy"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "Aarna law has supported me in all my legal needs from drafting employee agreement to commercial agreements. All business-related issue were addressed and resolved by them with ease and attention to detail. They are the people I turn to for all my legal requirements.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Pawan Jain"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "Ms Kamala and her entire team is uber professional in their approach and open to feedback at all times. They showed a high degree of commitment to the work and respectful of deadlines and expectations. It was indeed a pleasure to work with them and we look forward to work with them in future.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Tony Hales"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "Thank you, Shreyas and the team, at Aarna Law for your initial counsel and subsequent delivery of legal services. Not the run of the mill case, Aarna Law was able to cater to our specific needs on time and within budget - truly a professional firm with knowledge, experience and network across many domains. Once again thanks.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Vinay Bhagwan"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "My experience with Aarna Law has been nothing short of exceptional. The firm's founding partners, Shreyas and Kamala, have managed the firm with remarkable vision and dedication, taking it to greater heights. Their leadership, coupled with their deep commitment to excellence, sets Aarna Law apart in the legal industry.As a husband-and-wife team, Shreyas and Kamala bring a unique dynamism to the firm, blending their individual strengths to create a cohesive and highly effective partnership. Their strategic acumen and meticulous attention to detail have been instrumental in guiding us through complex legal challengeI am particularly impressed by their appetite for innovation, especially their efforts to integrate cutting-edge technology into their practice. This forward-thinking approach not only enhances efficiency but also ensures that clients receive the most sophisticated and effective legal solutions available. Beyond their technical proficiency, Shreyas and Kamala are known for their integrity, ethical standards, and genuine care for their clients. They have built a culture of trust and excellence that permeates the entire firm, I wholeheartedly recommend Aarna Law and its outstanding team to anyone seeking top-notch legal representation.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Pallavi Rao and Arun Kiezpadathil"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "We have been on the hunt for a law firm that was personable, capable, responsive and understood our business and Aarna law has been all of those things and more for us. We found Aarna law after a global search and are thrilled that we did.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Pranav Nahar"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "Manjushree and the team at Aarna Law were given a mandate to find the most optimised and regulatory compatible structure to conduct our real estate fintech experience. They handled the mandate with clarity and detail. What impressed us that we had many doubts and queries that we persisted with and they patiently worked through all the details we requested. Their client servicing and legal expertise was very professional. It was a pleasure working with them.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Aashika Abraham"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "I have thoroughly enjoyed working with Shreyas & Kamala and their team at Aarna Law - mostly because their legal opinion always comes balanced with wisdom, perspective and commercial/ social/ political context too., Their internal calling for justice strengthens their practice and this comes through in their commitment to find legal solutions and settlements at the earliest.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Mukesh Shah"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "We at Novalite Limited had the pleasure of working with Aarna Law, and specifically with Mr. Shreyas Jayasimha, on several complex legal matters. The experience was nothing short of exceptional. Mr. Jayasimha and his team demonstrated an outstanding level of professionalism, expertise, and dedication., What truly sets Aarna Law apart is their holistic approach to legal services. They not only guide you through the legal formalities with precision but also provide invaluable advisory and consultation that aligns seamlessly with our business lifestyle. Their ability to understand our unique needs and tailor their services accordingly made all the difference., We are extremely grateful for the support and insight provided by Mr. Jayasimha and the entire Aarna Law team. They have been more than just legal advisors; they have been true partners in our business journey., Thank you, Aarna Law, for your unwavering commitment to excellence. We look forward to continuing our collaboration in the future.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Kunal Shah"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "We are pleased to share that OnePaper is entirely satisfied with the services provided by Aarna Law. Vidhisha, Punti, and the entire team demonstrated exceptional skill and dedication in addressing our needs. Their efforts and timely assistance played a crucial role in achieving a favourable order for our matter., We greatly appreciate the team's hard work and commitment to delivering satisfactory results., Thank you once again for your support.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ]
}`,
          }}
        />

        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WJW9WNHQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {/* External scripts */}
        <Script src="/tracking.js" strategy="afterInteractive" />
        <Script
          src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YWL8EWE9MB"
          strategy="afterInteractive"
          async
        />
        <ClarityInit />
      </body>
    </html>
  );
}
