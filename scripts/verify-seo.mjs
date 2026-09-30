/**
 * Public-site SEO regression checks.
 * Run: node scripts/verify-seo.mjs
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { INDEXABLE_PATHS, ORIGIN } = require("./seo-lib.js");

const results = {};
function pass(key, ok, detail = "") {
  results[key] = ok ? "PASS" : "FAIL";
  console.log(`${ok ? "✓" : "✗"} ${key}${detail ? `: ${detail}` : ""}`);
}

function read(rel) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

const robots = read("robots.txt");
pass("ROBOTS EXISTS", robots.includes("Sitemap: https://www.4elementsoilfieldservices.com/sitemap.xml"), "production sitemap referenced");
pass("ROBOTS DISALLOW ADMIN", robots.includes("Disallow: /admin"), "admin excluded");
pass("SITEMAP EXISTS", existsSync("sitemap.xml"), "");

const sitemap = read("sitemap.xml");
pass("SITEMAP NO ADMIN", !sitemap.includes("/admin"), "private app not listed");
pass(
  "SITEMAP URLS",
  INDEXABLE_PATHS.every((p) => sitemap.includes(`${ORIGIN}${p === "/" ? "/" : p}`)),
  `${INDEXABLE_PATHS.length} indexable URLs`
);
pass("SITEMAP NO QUOTES", !sitemap.includes("-quote"), "form pages excluded");

const xmlOk = /<urlset[\s\S]*<\/urlset>/.test(sitemap) && (sitemap.match(/<loc>/g) || []).length === INDEXABLE_PATHS.length;
pass("SITEMAP XML", xmlOk, `${(sitemap.match(/<loc>/g) || []).length} loc tags`);

const pageFiles = [
  ["index.html", "/", true],
  ["divisions/trucking.html", "/divisions/trucking", true],
  ["divisions/automotive.html", "/divisions/automotive", true],
  ["divisions/construction.html", "/divisions/construction", true],
  ["divisions/safety.html", "/divisions/safety", true],
  ["divisions/hydrovac.html", "/divisions/hydrovac", true],
  ["affiliates/clean-air.html", "/affiliates/clean-air", true],
  ["affiliates/training.html", "/affiliates/training", true],
  ["affiliates/zealous.html", "/affiliates/zealous", true],
  ["affiliates/automation.html", "/affiliates/automation", true],
  ["affiliates/thunder-run.html", "/affiliates/thunder-run", true],
  ["affiliates/thunder-stone.html", "/affiliates/thunder-stone", true],
  ["affiliates/droneops.html", "/affiliates/droneops", true],
  ["privacy-policy.html", "/privacy-policy", true],
  ["terms-and-conditions.html", "/terms-and-conditions", true],
  ["trucking-quote.html", "/trucking-quote", false],
  ["automotive-quote.html", "/automotive-quote", false],
  ["construction-quote.html", "/construction-quote", false],
  ["safety-quote.html", "/safety-quote", false],
];

const titles = new Set();
const descriptions = new Set();
let jsonLdOk = true;
let h1Ok = true;
let canonicalOk = true;
let robotsMetaOk = true;
const broken = [];

function fileForHref(href) {
  const clean = href.split("?")[0].split("#")[0];
  if (!clean || clean.startsWith("http") || clean.startsWith("mailto:") || clean.startsWith("tel:")) return null;
  if (clean === "/" || clean === "") return "index.html";
  const noSlash = clean.replace(/^\//, "");
  if (existsSync(noSlash)) return noSlash;
  if (existsSync(`${noSlash}.html`)) return `${noSlash}.html`;
  if (existsSync(`${noSlash}/index.html`)) return `${noSlash}/index.html`;
  return false;
}

for (const [file, path, indexable] of pageFiles) {
  const html = read(file);
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || "";
  const robotsMeta = (html.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || "";
  const h1 = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || []).length;
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  titles.add(title);
  descriptions.add(desc);
  if (!title) h1Ok = false;
  if (h1 !== 1) h1Ok = false;
  const expectedCanon = path === "/" ? `${ORIGIN}/` : `${ORIGIN}${path}`;
  if (canonical !== expectedCanon) canonicalOk = false;
  if ((html.match(/rel="canonical"/g) || []).length !== 1) canonicalOk = false;
  if (indexable && !robotsMeta.includes("index")) robotsMetaOk = false;
  if (!indexable && !robotsMeta.includes("noindex")) robotsMetaOk = false;
  if (!ld || (html.match(/application\/ld\+json/g) || []).length !== 1) jsonLdOk = false;
  else {
    try {
      JSON.parse(ld[1]);
    } catch {
      jsonLdOk = false;
    }
  }
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    const mapped = fileForHref(href);
    if (mapped === false) broken.push(`${file} -> ${href}`);
  }
}

pass("UNIQUE TITLES", titles.size === pageFiles.length, `${titles.size} titles`);
pass("UNIQUE DESCRIPTIONS", descriptions.size === pageFiles.length, `${descriptions.size} descriptions`);
pass("ONE H1 EACH", h1Ok, "exactly one H1 on public pages");
pass("CANONICALS", canonicalOk, "www production URLs");
pass("ROBOTS META", robotsMetaOk, "index vs noindex on quotes");
pass("JSON-LD", jsonLdOk, "valid JSON on every public page");
pass(
  "HYDROVAC PAGE",
  existsSync("divisions/hydrovac.html") &&
    sitemap.includes("https://www.4elementsoilfieldservices.com/divisions/hydrovac") &&
    !existsSync("divisions/hydro-vac.html"),
  "crawlable /divisions/hydrovac"
);
pass("INTERNAL LINKS", broken.length === 0, broken.slice(0, 8).join("; ") || "all resolve");
pass(
  "NO INDEXING BLOCKERS ON HOME",
  read("index.html").includes('content="index,follow"') && !read("index.html").includes("noindex"),
  ""
);

const failed = Object.entries(results).filter(([, value]) => value === "FAIL");
console.log("\n=== Scorecard ===");
for (const [key, value] of Object.entries(results)) console.log(`${key}: ${value}`);
process.exit(failed.length ? 1 : 0);
