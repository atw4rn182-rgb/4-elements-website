/**
 * Shared SEO helpers for 4 Elements public pages.
 * Canonical host: https://www.4elementsoilfieldservices.com
 */
const ORIGIN = "https://www.4elementsoilfieldservices.com";
const LOGO = `${ORIGIN}/images/4Elogoclean.png`;
const OG_IMAGE = `${ORIGIN}/images/logo-hero-mark.png`;

function fileToPath(file) {
  if (file === "index.html" || file === "/") return "/";
  return `/${String(file).replace(/^\//, "").replace(/\.html$/, "")}`;
}

function absoluteUrl(path) {
  const normalized = fileToPath(path);
  return normalized === "/" ? `${ORIGIN}/` : `${ORIGIN}${normalized}`;
}

function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${ORIGIN}/#business`,
    name: "4 Elements Oilfield Services LLC",
    alternateName: ["Four Elements Oilfield Services", "4 Elements"],
    url: `${ORIGIN}/`,
    telephone: "+15759413311",
    email: "PURCHASING@4ELEMENTSOILFIELD.COM",
    image: LOGO,
    logo: LOGO,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1400 W. Derrick Rd.",
      addressLocality: "Carlsbad",
      addressRegion: "NM",
      postalCode: "88220",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "Carlsbad", addressRegion: "NM", addressCountry: "US" },
      { "@type": "AdministrativeArea", name: "Southeastern New Mexico" },
      { "@type": "AdministrativeArea", name: "West Texas" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "4 Elements services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Oilfield trucking and heavy haul" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automotive and diesel repair" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Oilfield construction" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Safety oversight and equipment support" } },
      ],
    },
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${ORIGIN}/#website`,
    name: "4 Elements Oilfield Services LLC",
    url: `${ORIGIN}/`,
    publisher: { "@id": `${ORIGIN}/#business` },
    inLanguage: "en-US",
  };
}

function webPageJsonLd({ title, description, path, isPartOfBusiness = true }) {
  const url = absoluteUrl(path);
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url.replace(/\/$/, "")}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${ORIGIN}/#website` },
    inLanguage: "en-US",
  };
  if (isPartOfBusiness) page.about = { "@id": `${ORIGIN}/#business` };
  return page;
}

function seoHead({ title, description, path, indexable = true, extraJsonLd = [] }) {
  const url = absoluteUrl(path);
  const robots = indexable ? "index,follow" : "noindex,follow";
  const graph = [websiteJsonLd(), businessJsonLd(), webPageJsonLd({ title, description, path }), ...extraJsonLd].map(
    (node) => {
      const copy = { ...node };
      delete copy["@context"];
      return copy;
    }
  );

  return `  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="robots" content="${robots}">
  <meta name="googlebot" content="${robots}">
  <meta name="theme-color" content="#0A2540">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="4 Elements Oilfield Services LLC">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(OG_IMAGE)}">
  <meta property="og:image:alt" content="4 Elements Oilfield Services LLC">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(OG_IMAGE)}">
  <link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/images/favicon-48.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const INDEXABLE_PATHS = [
  "/",
  "/divisions/trucking",
  "/divisions/automotive",
  "/divisions/construction",
  "/divisions/safety",
  "/divisions/hydrovac",
  "/affiliates/clean-air",
  "/affiliates/training",
  "/affiliates/zealous",
  "/affiliates/automation",
  "/affiliates/thunder-run",
  "/affiliates/thunder-stone",
  "/affiliates/droneops",
  "/privacy-policy",
  "/terms-and-conditions",
];

module.exports = {
  ORIGIN,
  LOGO,
  OG_IMAGE,
  INDEXABLE_PATHS,
  fileToPath,
  absoluteUrl,
  businessJsonLd,
  websiteJsonLd,
  webPageJsonLd,
  seoHead,
  esc,
};
