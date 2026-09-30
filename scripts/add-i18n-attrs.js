/**
 * Adds data-i18n markers and loads js/i18n.js on all site HTML pages.
 * Run: node scripts/add-i18n-attrs.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const files = [
  "index.html",
  "trucking-quote.html",
  "automotive-quote.html",
  "construction-quote.html",
  "safety-quote.html",
  "divisions/trucking.html",
  "divisions/automotive.html",
  "divisions/construction.html",
  "divisions/safety.html",
  "divisions/hydrovac.html",
  "affiliates/clean-air.html",
  "affiliates/automation.html",
  "affiliates/zealous.html",
  "affiliates/training.html",
  "affiliates/thunder-run.html",
  "affiliates/thunder-stone.html",
  "affiliates/droneops.html",
];

function addScript(html, prefix) {
  const tag = `<script src="${prefix}js/i18n.js"></script>`;
  if (html.includes("js/i18n.js")) return html;
  if (html.includes('<script src="' + prefix + 'js/main.js"></script>')) {
    return html.replace(
      `<script src="${prefix}js/main.js"></script>`,
      `<script src="${prefix}js/main.js"></script>\n  ${tag}`
    );
  }
  if (html.includes('<script src="' + prefix + 'js/quote-form.js"></script>')) {
    return html.replace(
      `<script src="${prefix}js/quote-form.js"></script>`,
      `${tag}\n  <script src="${prefix}js/quote-form.js"></script>`
    );
  }
  return html.replace("</body>", `  ${tag}\n</body>`);
}

function markTags(html) {
  // Add data-i18n to common text-bearing tags that don't already have it
  const tags = [
    "h1",
    "h2",
    "h3",
    "p",
    "dt",
    "dd",
    "li",
    "label",
    "option",
    "a",
    "button",
    "span",
  ];

  tags.forEach((tag) => {
    const re = new RegExp(`<(${tag})(\\s[^>]*)?>`, "gi");
    html = html.replace(re, (full, name, attrs) => {
      attrs = attrs || "";
      if (/data-i18n/i.test(attrs)) return full;
      // Skip empty / utility anchors without visible words later handled by content
      if (tag === "a" && /header__brand/i.test(attrs)) {
        return full;
      }
      if (tag === "p" && /home-overview/i.test(attrs)) {
        return full;
      }
      if (tag === "span" && /class="[^"]*home-title__/i.test(attrs)) {
        return full;
      }
      if (tag === "span" && /page-list__cta/i.test(attrs) && !/data-i18n/i.test(attrs)) {
        return `<${name}${attrs} data-i18n>`;
      }
      if (tag === "span") return full;
      if (tag === "a" && /mailto:|tel:/i.test(attrs) && !/>[^<]*[A-Za-z]{3}/.test(full)) {
        return full;
      }
      return `<${name}${attrs} data-i18n>`;
    });
  });

  // Placeholders
  html = html.replace(
    /placeholder="([^"]+)"/g,
    (m, ph) => `placeholder="${ph}" data-i18n-placeholder`
  );

  return html;
}

function specialHome(html) {
  // Structured tagline with accent
  html = html.replace(
    /<h1 class="hero__headline">([\s\S]*?)<\/h1>/,
    '<h1 class="hero__headline" data-i18n>Your One Stop Shop for <span class="text-accent">Oilfield</span>, Mining &amp; Industrial Services in Carlsbad, NM</h1>'
  );
  html = html.replace(
    /<p class="hero__subheadline">[\s\S]*?<\/p>/,
    '<p class="hero__subheadline" data-i18n>When minutes, money, and mileage matter.</p>'
  );
  html = html.replace(
    /<span class="home-header__wordmark-rest">Oilfield Services LLC<\/span>/,
    '<span class="home-header__wordmark-rest" data-i18n>Oilfield Services LLC</span>'
  );
  return html;
}

for (const rel of files) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, "utf8");
  const prefix = rel.includes("/") ? "../" : "";
  html = markTags(html);
  if (rel === "index.html") html = specialHome(html);
  html = html.replace(
    /(<a href="\/" class="(?:home|page)-header__brand"[^>]*) data-i18n/g,
    "$1"
  );
  html = addScript(html, prefix);
  fs.writeFileSync(file, html, "utf8");
  console.log("Updated", rel);
}

console.log("Done");
