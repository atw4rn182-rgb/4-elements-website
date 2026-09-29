/**
 * Injects canonical, robots, Open Graph, and JSON-LD into static pages
 * that are not produced by generate-pages.js.
 * Run after generate-pages.js: node scripts/apply-static-seo.js
 */
const fs = require("fs");
const path = require("path");
const { seoHead } = require("./seo-lib");

const root = path.join(__dirname, "..");

const pages = [
  {
    file: "index.html",
    title: "4 Elements Oilfield Services | Carlsbad, NM",
    description:
      "4 Elements Oilfield Services LLC in Carlsbad, NM provides oilfield trucking, auto and diesel repair, construction, and safety services across SE New Mexico and West Texas.",
    path: "/",
    indexable: true,
  },
  {
    file: "trucking-quote.html",
    title: "Request a Trucking Quote | 4 Elements Carlsbad, NM",
    description:
      "Request a quote for aggregate trucking, dumps, or heavy haul from 4 Elements in Carlsbad, NM, serving SE New Mexico and West Texas.",
    path: "/trucking-quote",
    indexable: false,
  },
  {
    file: "automotive-quote.html",
    title: "Request Auto & Diesel Repair Quote | 4 Elements",
    description:
      "Request a quote for diesel repair, fleet maintenance, diagnostics, or field support from 4 Elements Automotive in Carlsbad, NM.",
    path: "/automotive-quote",
    indexable: false,
  },
  {
    file: "construction-quote.html",
    title: "Request a Construction Quote | 4 Elements Carlsbad, NM",
    description:
      "Request a quote for heavy equipment construction, reclamation, remediation, or site work from 4 Elements in Carlsbad, NM.",
    path: "/construction-quote",
    indexable: false,
  },
  {
    file: "safety-quote.html",
    title: "Request a Safety Services Quote | 4 Elements Carlsbad, NM",
    description:
      "Request a quote for safety oversight, permitting, equipment, hydration, or onsite support from 4 Elements in Carlsbad, NM.",
    path: "/safety-quote",
    indexable: false,
  },
  {
    file: "privacy-policy.html",
    title: "Privacy Policy | 4 Elements Oilfield Services",
    description:
      "Privacy Policy for Four Elements Oilfield Services, including how mobile phone numbers and operational SMS communications are handled.",
    path: "/privacy-policy",
    indexable: true,
  },
  {
    file: "terms-and-conditions.html",
    title: "Terms and Conditions | 4 Elements Oilfield Services",
    description:
      "Terms and Conditions and SMS program terms for Four Elements Oilfield Services operational and dispatch communications.",
    path: "/terms-and-conditions",
    indexable: true,
  },
];

function patchHtml(html, config) {
  const head = seoHead(config).trim();
  const titleIdx = html.indexOf("<title>");
  const preconnectIdx = html.indexOf('<link rel="preconnect" href="https://fonts.googleapis.com">');
  if (titleIdx === -1 || preconnectIdx === -1) {
    throw new Error(`SEO head inject failed for ${config.path}`);
  }
  html = `${html.slice(0, titleIdx)}${head}\n  ${html.slice(preconnectIdx)}`;
  html = html.replace(/href="css\/styles\.css"/g, 'href="/css/styles.css"');
  html = html.replace(/src="css\//g, 'src="/css/');
  html = html.replace(/href="index\.html"/g, 'href="/"');
  html = html.replace(/src="images\//g, 'src="/images/');
  html = html.replace(/src="js\//g, 'src="/js/');
  html = html.replace(/preload="auto"/g, 'preload="none"');
  html = html.replace(
    /href="divisions\/([a-z-]+)\.html"/g,
    'href="/divisions/$1"'
  );
  html = html.replace(
    /alt="4 Elements Oilfield Services LLC"/g,
    'alt="4 Elements Oilfield Services LLC logo"'
  );
  if (!html.includes('rel="canonical"')) {
    throw new Error(`SEO head inject failed for ${config.path}`);
  }
  return html;
}

for (const page of pages) {
  const filePath = path.join(root, page.file);
  let html = fs.readFileSync(filePath, "utf8");
  html = patchHtml(html, page);
  fs.writeFileSync(filePath, html, "utf8");
  console.log("SEO patched", page.file);
}
