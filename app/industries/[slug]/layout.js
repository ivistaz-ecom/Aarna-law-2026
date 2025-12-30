// app/industries/[slug]/layout.js

export async function generateMetadata({ params }) {
  const response = await fetch(
    `https://docs.aarnalaw.com/wp-json/wp/v2/industries?_embed&slug=${params.slug}`
  );

  if (!response.ok) {
    console.error("Failed to fetch industry post:", response.statusText);
    return {
      title: "Industry-Specific Legal Solutions | Aarna Law",
      description: "Industry-Specific Legal Solutions | Aarna Law",
      metadataBase: new URL("https://www.aarnalaw.com/"),
      openGraph: {
        url: `https://www.aarnalaw.com/industries/${params.slug}`,
        title: "Industry-Specific Legal Solutions | Aarna Law",
        description: "Industry-Specific Legal Solutions | Aarna Law",
        images: [
          {
            url: "/social.png",
            width: 800,
            height: 600,
            alt: "Industry-Specific Legal Solutions | Aarna Law",
          },
        ],
      },
    };
  }

  const postData = await response.json();
  const post = postData?.[0];

  const faqs = [];
  for (let i = 1; i <= 10; i++) {
    const question = post?.acf?.[`faq_${i}`];
    const answer = post?.acf?.[`faqs_description_${i}`];
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return {
    title: post?.acf?.meta_title
      ? `${post.acf.meta_title}`
      : "Industry-Specific Legal Solutions | Aarna Law",
    description: post?.acf?.meta_description || "Industry-Specific Legal Solutions | Aarna Law",
    metadataBase: new URL("https://www.aarnalaw.com/industries/"),
    openGraph: {
      url: `https://www.aarnalaw.com/industries/${params.slug}`,
      title: post?.acf?.meta_title || "Industry-Specific Legal Solutions | Aarna Law",
      description: post?.acf?.meta_description || "",
      images:
        post?.acf?.mobile_banner?.url
          ? [
              {
                url: post.acf.mobile_banner.url,
                width: 800,
                height: 600,
                alt: post.acf.meta_title || "Industry-Specific Legal Solutions | Aarna Law",
              },
            ]
          : [
              {
                url: "/aarnalaw_new_banner.jpg",
                width: 800,
                height: 600,
                alt: "Industry-Specific Legal Solutions | Aarna Law",
              },
            ],
    },
    other: {
      faqJsonLd: faqSchema ? JSON.stringify(faqSchema) : "",
    },
  };
}

export default async function RootLayout({ children, params }) {
  const response = await fetch(
    `https://docs.aarnalaw.com/wp-json/wp/v2/industries?_embed&slug=${params.slug}`
  );

  const postData = await response.json();
  const post = postData?.[0];

  const faqs = [];
  for (let i = 1; i <= 10; i++) {
    const question = post?.acf?.[`faq_${i}`];
    const answer = post?.acf?.[`faqs_description_${i}`];
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2),
          }}
        />
      )}
      {children}
    </>
  );
}


