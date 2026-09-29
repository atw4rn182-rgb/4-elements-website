/**
 * Regenerates division & affiliate pages with full Google Sites content.
 * Run: node scripts/generate-pages.js
 */
const fs = require("fs");
const path = require("path");
const { seoHead, fileToPath } = require("./seo-lib");

const root = path.join(__dirname, "..");

const SHARED = {
  address: "1400 W. Derrick Rd., Carlsbad, NM 88220",
  officePhone: "(575) 941-3311",
  officeTel: "+15759413311",
  purchasingEmail: "PURCHASING@4ELEMENTSOILFIELD.COM",
  purchasingPhone: "(575) 988-5351",
  hrPhone: "(575) 988-5479",
  applyCdl: "https://4elementsoilfield.dotshield.software/newapplication",
  applyNonCdl: "https://4elementsoilfield.dotshield.software/ndotapplication",
  jotformGeneral: "https://form.jotform.com/253164822616053",
  jotformCdl: "https://form.jotform.com/253205763785161",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function quoteList(quoteFile, items) {
  const quotePath = `/${String(quoteFile).replace(/\.html$/, "")}`;
  return `<ul class="page-list page-list--quotes">
${items
  .map((label) => {
    const href = `${quotePath}?service=${encodeURIComponent(label)}`;
    return `          <li>
            <a class="page-list__link" href="${href}">
              <span class="page-list__label">${esc(label)}</span>
              <span class="page-list__cta">Request quote</span>
            </a>
          </li>`;
  })
  .join("\n")}
            </ul>`;
}

function relatedSection(links) {
  return `<nav class="page-section page-related" aria-label="Related 4 Elements services">
            <h2>Related 4 Elements services</h2>
            <ul class="page-list">
${links
  .map(
    ([href, label]) =>
      `              <li><a href="${esc(href)}">${esc(label)}</a></li>`
  )
  .join("\n")}
            </ul>
          </nav>`;
}

function plainList(items) {
  return `<ul class="page-list">
${items.map((s) => `          <li>${esc(s)}</li>`).join("\n")}
            </ul>`;
}

function contactBlock(rows) {
  const items = rows
    .map(([label, valueHtml]) => {
      return `            <div class="page-contact__item">
              <dt>${esc(label)}</dt>
              <dd>${valueHtml}</dd>
            </div>`;
    })
    .join("\n");
  return `<section class="page-section">
            <h2>Contact</h2>
            <dl class="page-contact">
${items}
            </dl>
          </section>`;
}

function noteBlock(text) {
  return `<p class="page-note">${esc(text)}</p>`;
}

function careersBlock({ status, details, links }) {
  const linkHtml = (links || [])
    .map(
      (l) =>
        `              <a class="btn btn--outline" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`
    )
    .join("\n");
  return `<section class="page-section page-section--careers">
            <h2>Career Opportunities</h2>
            ${status ? `<p class="page-careers__status">${esc(status)}</p>` : ""}
            ${details ? `<p class="page-careers__details">${esc(details)}</p>` : ""}
            ${
              linkHtml
                ? `<div class="page-actions">
${linkHtml}
            </div>`
                : ""
            }
          </section>`;
}

function brandsBlock(title, items) {
  return `<section class="page-section">
            <h2>${esc(title)}</h2>
            <ul class="page-brands">
${items.map((s) => `              <li>${esc(s)}</li>`).join("\n")}
            </ul>
          </section>`;
}

function shell({
  file,
  title,
  description,
  eyebrow,
  headingHtml,
  lead,
  intro,
  quoteHref,
  bodyHtml,
}) {
  const quoteNav = quoteHref
    ? `<a href="${quoteHref}">Request a Quote</a>`
    : `<a href="mailto:${SHARED.purchasingEmail}">Request a Quote</a>`;
  const introHtml = intro
    ? `\n          <p class="page-hero__intro">${esc(intro)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({ title, description, path: fileToPath(file), indexable: true })}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="page page--hero">
  <div class="hero__media page-bg-media" aria-hidden="true">
    <div class="hero__slide hero__slide--active" data-hero-slide data-type="image" data-duration="9">
      <div class="hero__pan hero__pan--ltr">
        <img src="/images/hero-fleet.jpg" alt="" class="hero__slide-media" width="1920" height="1080">
      </div>
    </div>
    <div class="hero__slide" data-hero-slide data-type="video" data-duration="10">
      <video class="hero__slide-media" muted playsinline preload="none" loop>
        <source src="/images/hero-loader.mp4" type="video/mp4">
      </video>
    </div>
    <div class="hero__slide" data-hero-slide data-type="image" data-duration="9">
      <div class="hero__pan hero__pan--rtl">
        <img src="/images/hero-quarry.jpg" alt="" class="hero__slide-media" width="1920" height="1080" loading="lazy">
      </div>
    </div>
    <div class="hero__slide" data-hero-slide data-type="video" data-duration="10">
      <video class="hero__slide-media" muted playsinline preload="none" loop>
        <source src="/images/hero-dumping.mp4" type="video/mp4">
      </video>
    </div>
    <div class="hero__overlay"></div>
  </div>

  <div class="page-shell">
    <header class="page-header">
      <div class="page-header__inner">
        <a href="/" class="page-header__brand" aria-label="4 Elements Oilfield Services LLC">
          <img
            src="/images/4Elogoclean.png?v=60"
            alt="4 Elements Oilfield Services LLC logo"
            class="page-header__logo"
            width="1080"
            height="1075"
          >
        </a>
        <nav class="page-header__nav" aria-label="Page navigation">
          <a href="/">Home</a>
          <a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>
          ${quoteNav}
        </nav>
      </div>
    </header>

    <main class="page-main">
      <div class="page-panel">
        <div class="page-hero">
          <p class="page-hero__eyebrow">${esc(eyebrow)}</p>
          <h1 class="page-hero__title">${headingHtml}</h1>
          <p class="page-hero__lead">${esc(lead)}</p>${introHtml}
        </div>
        <div class="page-body">
${bodyHtml}
          <section class="page-section page-section--cta">
            <h2>Ready to get started?</h2>
            <p>Call our Carlsbad office or request a quote - we serve SE New Mexico and West Texas.</p>
            <div class="page-actions">
              <a class="btn btn--primary" href="tel:${SHARED.officeTel}">Call ${SHARED.officePhone}</a>
              ${
                quoteHref
                  ? `<a class="btn btn--outline" href="${quoteHref}">Request a Quote</a>`
                  : `<a class="btn btn--outline" href="mailto:${SHARED.purchasingEmail}">Request a Quote</a>`
              }
              <a class="btn btn--outline" href="/">Back to Home</a>
            </div>
          </section>
        </div>
      </div>
    </main>

    <footer class="page-footer">
      <p>${SHARED.address}  ·  4 Elements Oilfield Services LLC</p>
      <nav class="page-footer__links" aria-label="Legal">
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms-and-conditions">Terms &amp; Conditions</a>
      </nav>
    </footer>
  </div>

  <script src="/js/main.js"></script>
  <script src="/js/i18n.js"></script>
</body>
</html>
`;
}

const pages = [
  {
    file: "divisions/trucking.html",
    title: "Oilfield Trucking in Carlsbad, NM | 4 Elements",
    description:
      "Aggregate hauling, belly dumps, end dumps, dump trucks, heavy haul, and semi flat bed from 4 Elements in Carlsbad, New Mexico. Serving SE New Mexico and West Texas.",
    eyebrow: "Division",
    headingHtml: `Trucking <span class="text-accent">Division</span>`,
    lead: "Aggregate trucking and heavy haul across SE New Mexico and West Texas - when minutes, money, and mileage matter.",
    intro:
      "The 4 Elements Trucking Division hauls aggregate and heavy equipment for oilfield, mining, and industrial customers from our yard at 1400 W. Derrick Rd. in Carlsbad, New Mexico.",
    quoteHref: "/trucking-quote",
    body: () =>
      [
        contactBlock([
          ["Manager", "Jeremiah Terrazas - Trucking Manager &amp; Heavy Equipment Mechanic"],
          [
            "Email",
            `<a href="mailto:Jeremiah.Terrazas@4elementsoilfield.com">Jeremiah.Terrazas@4elementsoilfield.com</a>`,
          ],
          [
            "Direct",
            `<a href="tel:+15756364652">(575) 636-4652</a>`,
          ],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Purchasing",
            `<a href="mailto:${SHARED.purchasingEmail}">${SHARED.purchasingEmail}</a> / <a href="tel:+15759885351">${SHARED.purchasingPhone}</a>`,
          ],
        ]),
        `<section class="page-section">
            <h2>Trucking Capabilities</h2>
            ${quoteList("trucking-quote.html", [
              "Aggregate Hauling",
              "Debris Removal",
              "Belly Dumps",
              "End Dumps",
              "Dump Trucks",
              "Heavy Haul",
              "Semi Flat Bed",
            ])}
          </section>`,
        careersBlock({
          status:
            "JANUARY 2026 - Now hiring CDL Drivers (Belly Dump / End Dump / Dump Truck / Heavy Haul). Diesel / Heavy Equipment Mechanic positions also recruiting.",
          details:
            "Must be 21+ with a valid CDL and 2 years driving experience for driver roles. Competitive hourly wages DOE, paid vacation/sick/holidays, 401(k), and health benefits. Pre-employment drug screen and clean driving record required. Housing and per diem are not provided. Call Jeremiah Terrazas (575) 636-4652 or HR (575) 988-5479. CDL applications must be completed online (assistance available at the Derrick Rd office).",
          links: [
            { label: "Apply CDL Online", href: SHARED.applyCdl },
            { label: "CDL JotForm", href: SHARED.jotformCdl },
            { label: "Mechanic / Non-CDL Apply", href: SHARED.applyNonCdl },
            { label: "General Application", href: SHARED.jotformGeneral },
          ],
        }),
        relatedSection([
          ["/divisions/construction", "Construction Division"],
          ["/divisions/automotive", "Automotive & Diesel Repair"],
          ["/affiliates/thunder-stone", "Thunder Stone Quarry"],
        ]),
      ].join("\n"),
  },
  {
    file: "divisions/automotive.html",
    title: "Auto & Diesel Repair in Carlsbad, NM | 4 Elements",
    description:
      "Full-service automotive and diesel mechanic work in Carlsbad, NM—fleet maintenance, heavy equipment repair, diagnostics, and field support from 4 Elements.",
    eyebrow: "Division",
    headingHtml: `Automotive &amp; Diesel <span class="text-accent">Repair</span>`,
    lead: "Full Service Automotive and Diesel Mechanic Service Center - keeping your fleet and equipment ready for the job.",
    intro:
      "4 Elements Automotive & Diesel Repair is a full-service shop in Carlsbad, New Mexico, supporting oilfield, mining, industrial, and commercial fleets with shop-based and field mechanic work.",
    quoteHref: "/automotive-quote",
    body: () =>
      [
        contactBlock([
          ["Manager", "Jake Tipton - Automotive Manager"],
          [
            "Email",
            `<a href="mailto:Automotive@4elementsoilfield.com">Automotive@4elementsoilfield.com</a>`,
          ],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Purchasing",
            `<a href="mailto:${SHARED.purchasingEmail}">${SHARED.purchasingEmail}</a> / <a href="tel:+15759885351">${SHARED.purchasingPhone}</a>`,
          ],
        ]),
        `<section class="page-section">
            <h2>Services</h2>
            <p class="page-intro">4 Elements Automotive &amp; Diesel Repair is a full-service automotive and diesel mechanic service center supporting oilfield, mining, industrial, and commercial customers.</p>
            ${quoteList("automotive-quote.html", [
              "Full Service Automotive Repair",
              "Full Service Diesel Mechanic Service",
              "Heavy Equipment Repair",
              "Fleet Maintenance",
              "Preventive Service Programs",
              "Diagnostics and Troubleshooting",
              "Shop-Based Support",
              "Field Support",
            ])}
          </section>`,
        careersBlock({
          status:
            "JANUARY 2026 - Immediately hiring Diesel / Heavy Equipment Mechanic.",
          details:
            "Competitive hourly wages, paid vacation/sick/holidays, 401(k), and health benefits. Must pass a pre-employment drug screen and have a clean driving record. Clear English required; bilingual a plus. Call Trucking Manager Jeremiah Terrazas (575) 636-4652 or HR (575) 941-3311, or apply online / in person at the Derrick Rd office.",
          links: [
            { label: "Apply Online", href: SHARED.jotformGeneral },
            { label: "Non-CDL Application", href: SHARED.applyNonCdl },
          ],
        }),
        relatedSection([
          ["/divisions/trucking", "Trucking Division"],
          ["/divisions/construction", "Construction Division"],
          ["/divisions/safety", "Safety Division"],
        ]),
      ].join("\n"),
  },
  {
    file: "divisions/construction.html",
    title: "Oilfield Construction in Carlsbad, NM | 4 Elements",
    description:
      "Heavy equipment construction, road and pad building, welding, and MSHA-trained crews in Carlsbad, NM. Trucking, quarry materials, and safety support under a single bid.",
    eyebrow: "Division",
    headingHtml: `Construction <span class="text-accent">Division</span>`,
    lead: "Heavy equipment construction, reclamation/remediation, and maintenance - with trucking, quarry materials, safety techs, and project management available under a single bid.",
    intro:
      "The 4 Elements Construction Division builds and maintains oilfield and industrial sites from Carlsbad, New Mexico, with MSHA-trained operators, laborers, and welders.",
    quoteHref: "/construction-quote",
    body: () =>
      [
        contactBlock([
          ["Manager", "Daniel Vasquez - Construction Manager"],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Purchasing / Business Development",
            `<a href="mailto:${SHARED.purchasingEmail}">${SHARED.purchasingEmail}</a> / <a href="tel:+15759885351">${SHARED.purchasingPhone}</a>`,
          ],
        ]),
        `<section class="page-section">
            <h2>Construction Capabilities</h2>
            ${noteBlock(
              "Operators, laborers, and welders are all MSHA trained and recruited, hired, trained, and maintained within an in-house safety culture."
            )}
            ${quoteList("construction-quote.html", [
              "Heavy Equipment Construction",
              "New Road Construction & Repair",
              "Pad Building and Extensions",
              "Heli Pad Construction",
              "Fence Building / Cattle Guards",
              "Welding & Fabrication",
              "Laborers and Maintenance Personnel",
              "Reclamation / Remediation",
            ])}
            ${noteBlock(
              "On construction jobs, 4 Elements can source our own trucking, quarry materials, safety techs, and project management under a single bid."
            )}
          </section>`,
        careersBlock({
          status:
            "NOV 2025 - Now hiring for Hydrovac Driver / Operator. Applications for heavy equipment and laborer positions are kept on file for 6 months.",
          details:
            "Construction applications can be picked up at 1400 W. Derrick Rd, requested from HR, or completed online.",
          links: [
            { label: "Apply Non-CDL Online", href: SHARED.applyNonCdl },
            { label: "General Application", href: SHARED.jotformGeneral },
          ],
        }),
        relatedSection([
          ["/divisions/trucking", "Trucking Division"],
          ["/divisions/safety", "Safety Division"],
          ["/affiliates/thunder-run", "Thunder Run Concrete"],
          ["/affiliates/thunder-stone", "Thunder Stone Quarry"],
        ]),
      ].join("\n"),
  },
  {
    file: "divisions/safety.html",
    title: "Oilfield Safety Services in Carlsbad, NM | 4 Elements",
    description:
      "Safety technician oversight, permitting, equipment sales and service, and onsite support from 4 Elements in Carlsbad, New Mexico.",
    eyebrow: "Division",
    headingHtml: `Safety <span class="text-accent">Division</span>`,
    lead: "Safety oversight, permitting, equipment sales and service, and onsite support for oilfield and industrial operations.",
    intro:
      "The 4 Elements Safety Division supports oilfield and industrial jobs in and around Carlsbad, New Mexico with technician oversight, permitting, and onsite safety equipment.",
    quoteHref: "/safety-quote",
    body: () =>
      [
        contactBlock([
          ["Manager", "Dustin Higgins - Safety Manager"],
          [
            "Email",
            `<a href="mailto:Dustin.Higgins@4elementssafetyservices.com">Dustin.Higgins@4elementssafetyservices.com</a>`,
          ],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
        ]),
        `<section class="page-section">
            <h2>Safety Capabilities &amp; Commodities</h2>
            <h3 class="page-subtitle">Technician Oversight &amp; Consulting</h3>
            ${quoteList("safety-quote.html", [
              "Confined Space Oversight",
              "Hot Works Oversight",
              "Excavation Oversight",
              "Permitting",
              "Safety Oversight Supervision / Consulting",
            ])}
            <h3 class="page-subtitle">Equipment, Sales &amp; Onsite Support</h3>
            ${quoteList("safety-quote.html", [
              "Hydration Standby and Supplies",
              "Norm Monitoring",
              "Fire Extinguisher Sales / Services / Inspections",
              "Air Trailers",
              "Shower Trailers",
              "Rescue Trailers",
              "Cool Down Trailers",
              "Durahoist",
              "Positive Pressure Fans",
              "Safety Equipment Sales and Service",
            ])}
          </section>`,
        careersBlock({
          status:
            "NOV 2025 - Positions have been filled. Applications are encouraged and kept on file for 6 months when openings arise.",
          details:
            "Applications can be picked up at 1400 W. Derrick Rd, requested from HR, or completed online.",
          links: [
            { label: "Apply Online", href: SHARED.applyNonCdl },
            { label: "General Application", href: SHARED.jotformGeneral },
          ],
        }),
        relatedSection([
          ["/affiliates/training", "Training Division"],
          ["/divisions/construction", "Construction Division"],
          ["/divisions/trucking", "Trucking Division"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/clean-air.html",
    title: "HVAC & Generators in Carlsbad, NM | Clean Air Authority",
    description:
      "Residential, commercial, and industrial HVAC, Cummins generators, and authorized brand sales and service through Clean Air Authority, a 4 Elements affiliate in Carlsbad, NM.",
    eyebrow: "Affiliate",
    headingHtml: `Clean Air <span class="text-accent">Authority</span>`,
    lead: "HVAC preventive maintenance, installation, repair, and Cummins generator sales & service for residential, commercial, and industrial customers.",
    intro:
      "Clean Air Authority is a 4 Elements affiliate serving Carlsbad, New Mexico and the surrounding area with HVAC programs, installations, repairs, and Cummins generator sales and service.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          [
            "Manager",
            "Don Knealing - Licensed HVAC (NM License #418542, Exp 11/30/27)",
          ],
          [
            "Email",
            `<a href="mailto:Don.Knealing@cleanairauthority.org">Don.Knealing@cleanairauthority.org</a>`,
          ],
          [
            "Office Email",
            `<a href="mailto:office@cleanairauthority.org">office@cleanairauthority.org</a>`,
          ],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
        ]),
        `<section class="page-section">
            <h2>HVAC &amp; Generator Services</h2>
            ${plainList([
              "Residential / Commercial and Industrial HVAC Preventive Maintenance Programs",
              "New Installations and Retrofit Installations of HVAC Systems",
              "Residential / Commercial and Industrial HVAC Repairs",
              "Cummins Generator Sales and Services",
              "Shearer Authorized Sales and Services",
              "American Standard Authorized Sales and Service",
              "Samsung Authorized Sales and Service",
            ])}
          </section>`,
        brandsBlock("Authorized Dealer / Service", [
          "Cummins Generator Authorized Dealer and Certified Service Center",
          "Bryant Authorized Dealer, Installation and Service Center",
          "American Standard Heating & Air Conditioning Authorized Dealer, Installation and Service Center",
        ]),
        `<section class="page-section">
            <h2>Cummins Generators</h2>
            <p class="page-intro">Clean Air Authority and 4 Elements Oilfield Services LLC are certified as a Cummins Authorized Dealer and Service Shop for Cummins Generators - for personal, home, and industrial generator needs.</p>
            <div class="page-actions">
              <a class="btn btn--outline" href="https://quickserve.cummins.com/info/index.html" target="_blank" rel="noopener noreferrer">Cummins QuickServe</a>
            </div>
          </section>`,
        careersBlock({
          status:
            "NOVEMBER 2025 / JANUARY 2026 - Immediately hiring Journeyman Plumber for SE NM and West TX (industrial / commercial focus, some residential).",
          details:
            "Competitive hourly wages DOE, paid vacation/sick/holidays, 401(k), and health benefits. Call HR at (575) 941-3311 or apply online / in person at the Derrick Rd office.",
          links: [
            { label: "Apply Online", href: SHARED.jotformGeneral },
            { label: "Non-CDL Application", href: SHARED.applyNonCdl },
          ],
        }),
        relatedSection([
          ["/affiliates/automation", "Automation"],
          ["/affiliates/zealous", "Zealous Electrical Services"],
          ["/divisions/construction", "Construction Division"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/automation.html",
    title: "Oilfield Automation | 4 Elements Affiliate",
    description:
      "Oilfield and building automation, PLCs, SCADA, security, and AV from the 4 Elements Automation affiliate, coordinated from Carlsbad, NM.",
    eyebrow: "Affiliate",
    headingHtml: `Automation <span class="text-accent">Division</span>`,
    lead: "Install, maintain, and program instrumentation, PLCs/VFDs. Create field networks, comms/cameras and SCADA. Building automation HVACR controls and fully automated holiday displays.",
    intro:
      "The 4 Elements Automation affiliate installs and maintains instrumentation, PLCs, field networks, and SCADA for oilfield and building projects served from Carlsbad, New Mexico.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          ["Manager", "Lance Moore - Automation Manager"],
          [
            "Email",
            `<a href="mailto:Lance.Moore@4elementsoilfield.com">Lance.Moore@4elementsoilfield.com</a>`,
          ],
          [
            "Direct",
            `<a href="tel:+18062921078">(806) 292-1078</a>`,
          ],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Licenses",
            "TX Master Plumber #38513 · TX Journeyman Plumber #40575 · TX Journeyman Electrician #667657",
          ],
        ]),
        `<section class="page-section">
            <h2>Automation Capabilities</h2>
            ${plainList([
              "Oilfield Automation",
              "Residential / Commercial Building Automation",
              "Audio Visual and Sound Installations",
              "Distillery and Brewery Automation",
              "Fully Automated Holiday Light and Sound Displays",
              "Residential / Commercial Security Systems",
              "Residential / Commercial Surveillance Systems",
              "Networking and Wireless Communications",
            ])}
          </section>`,
        brandsBlock("Platforms & Brands", [
          "ABB TOTALFLOW",
          "IDEC",
          "OLEUMTECH",
          "TRIDIUM / NIAGARA",
          "IGNITION",
          "SNAP ONE",
          "CLARE ONE",
          "ALARM.COM",
          "TRIAD SOUND",
          "HONEYWELL",
          "ABB",
          "SQUARE D",
          "EATON",
          "PHOENIX",
          "TOSHIBA",
          "YASKAWA",
          "SIEMENS",
          "SCADAPAK",
          "SCHNEIDER ELECTRIC",
          "ALLEN BRADLEY",
          "MAPLE",
          "RED LION",
          "UBIQUITI",
          "FLOWCO",
          "ENDRESS & HAUSER",
        ]),
        brandsBlock("Authorized Dealer / Installation", [
          "Alarm.Com - Sales, Installation and Integration",
          "Clare One - Sales, Installation and Integration",
          "Honeywell - Sales, Installation and Integration",
          "Snap One - Sales, Installation and Integration",
          "Toshiba - Sales, Installation and Integration",
          "Yaskawa - Sales, Installation and Integration",
        ]),
        careersBlock({
          status: "NOV 2025 - Automation Tech position available.",
          details:
            "Applications can be picked up at the office, requested from HR, or completed online.",
          links: [
            { label: "Apply Online", href: SHARED.applyNonCdl },
            { label: "General Application", href: SHARED.jotformGeneral },
          ],
        }),
        relatedSection([
          ["/affiliates/zealous", "Zealous Electrical Services"],
          ["/affiliates/clean-air", "Clean Air Authority"],
          ["/divisions/construction", "Construction Division"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/zealous.html",
    title: "Electrical Services in Carlsbad, NM | Zealous",
    description:
      "Industrial, commercial, and residential electrical installation, repair, and maintenance from Zealous Electrical Services, a 4 Elements affiliate in Carlsbad, NM.",
    eyebrow: "Affiliate",
    headingHtml: `Zealous Electrical <span class="text-accent">Services</span>`,
    lead: "Industrial, commercial, and residential electrical installation, repair, and maintenance.",
    intro:
      "Zealous Electrical Services is a 4 Elements affiliate providing industrial, commercial, and residential electrical installation, repair, and maintenance in the Carlsbad, New Mexico area.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          [
            "Office Email",
            `<a href="mailto:office@zealouselectrical.com">office@zealouselectrical.com</a>`,
          ],
          [
            "Hiring / Automation Manager",
            `Lance Moore - <a href="tel:+18062921078">(806) 292-1078</a> · <a href="mailto:Lance.Moore@4elementsoilfield.com">Lance.Moore@4elementsoilfield.com</a>`,
          ],
          [
            "Office / HR",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
        ]),
        `<section class="page-section">
            <h2>Electrical Services</h2>
            ${plainList([
              "Industrial Electrical Installation, Repair and Maintenance",
              "Commercial Electrical Installation, Repair and Maintenance",
              "Residential Electrical Installation, Repair and Maintenance",
            ])}
          </section>`,
        careersBlock({
          status:
            "NOV 2025 / JANUARY 2026 - Current openings for Certified Licensed Electrician and Journeyman Electricians (SE NM and West TX, industrial / commercial focus).",
          details:
            "Competitive hourly wages DOE, paid vacation/sick/holidays, 401(k), and health benefits. Call Lance Moore (806) 292-1078 or HR (575) 941-3311, or apply online / in person.",
          links: [
            { label: "Apply Online", href: SHARED.jotformGeneral },
            { label: "Non-CDL Application", href: SHARED.applyNonCdl },
          ],
        }),
        relatedSection([
          ["/affiliates/automation", "Automation"],
          ["/divisions/construction", "Construction Division"],
          ["/affiliates/clean-air", "Clean Air Authority"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/training.html",
    title: "Oilfield Safety Training in Carlsbad, NM | 4 Elements",
    description:
      "PEC Safeland, lifesaving skills, equipment training, and authorized safety product distribution from the 4 Elements Training Division in Carlsbad, NM.",
    eyebrow: "Affiliate",
    headingHtml: `Training <span class="text-accent">Division</span>`,
    lead: "Oilfield lifesaving and MSHA training instructors - PEC Safeland, lifesaving skills, equipment training, and authorized safety product distribution.",
    intro:
      "The 4 Elements Training Division delivers oilfield lifesaving and equipment training from Carlsbad, New Mexico, including PEC Safeland and related safety classes.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          [
            "Training Coordinator",
            "Jose Sifuentes",
          ],
          [
            "Coordinator Email",
            `<a href="mailto:JOSE.SIFUENTES@4ELEMENTSSAFETYSERVICES.COM">JOSE.SIFUENTES@4ELEMENTSSAFETYSERVICES.COM</a>`,
          ],
          [
            "Sales / Lifesaving Training Specialist",
            `Earl Phelps - <a href="mailto:Earl.Phelps@4elementssafetyservices.com">Earl.Phelps@4elementssafetyservices.com</a>`,
          ],
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
        ]),
        `<section class="page-section">
            <h2>Training Classes &amp; Sales</h2>
            ${plainList([
              "PEC Safeland",
              "Veriforce / PEC Safe Driver",
              "H2S Clear",
              "Stop The Bleed / First Aid / CPR",
              "AED Devices and Instruction",
              "Rope Rescue",
              "Confined Space",
              "Hot Work",
              "Benzene Awareness",
              "Boom Lift",
              "Excavation",
              "Forklift",
              "Earthmoving Equipment",
              "Lock Out / Tag Out",
              "Specific Training Upon Request",
            ])}
          </section>`,
        `<section class="page-section">
            <h2>Products &amp; Distributorships</h2>
            <p class="page-intro">Contact Earl Phelps for quotes or more information on product lines and fit testing.</p>
            ${plainList([
              "My Medic licensed distributor",
              "Respirator Fit Testing and Online Medical Clearance",
              "PowerFlare licensed distributor",
              "Enola Gaye smoke grenade licensed distributor",
              "Phillips AED licensed distributor",
              "AVERT active shooter supplies: tac-pacs and cabinets",
            ])}
          </section>`,
        `<section class="page-section">
            <h2>Request Training or a Quote</h2>
            <p class="page-intro">Reach Jose Sifuentes or Earl Phelps to schedule classes or request pricing.</p>
            <div class="page-actions">
              <a class="btn btn--primary" href="mailto:JOSE.SIFUENTES@4ELEMENTSSAFETYSERVICES.COM">Email Training Coordinator</a>
              <a class="btn btn--outline" href="mailto:Earl.Phelps@4elementssafetyservices.com">Email Earl Phelps</a>
            </div>
          </section>`,
        relatedSection([
          ["/divisions/safety", "Safety Division"],
          ["/divisions/construction", "Construction Division"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/thunder-run.html",
    title: "Thunder Run Concrete | 4 Elements Affiliate",
    description:
      "Thunder Run Concrete is a 4 Elements affiliate partner in Carlsbad, NM, coordinated with construction and trucking.",
    eyebrow: "Affiliate",
    headingHtml: `Thunder Run <span class="text-accent">Concrete</span>`,
    lead: "Affiliate partner of 4 Elements Oilfield Services LLC supporting concrete needs alongside our construction and trucking divisions.",
    intro:
      "Thunder Run Concrete is listed among the 4 Elements affiliates. Contact the Carlsbad office to coordinate concrete support with Construction and Trucking.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Purchasing",
            `<a href="mailto:${SHARED.purchasingEmail}">${SHARED.purchasingEmail}</a> / <a href="tel:+15759885351">${SHARED.purchasingPhone}</a>`,
          ],
        ]),
        `<section class="page-section">
            <h2>About</h2>
            <p class="page-intro">Thunder Run Concrete is listed among the 4 Elements affiliate partners. Contact our Carlsbad office for availability, project support, and coordination with Construction and Trucking.</p>
          </section>`,
        relatedSection([
          ["/divisions/construction", "Construction Division"],
          ["/divisions/trucking", "Trucking Division"],
          ["/affiliates/thunder-stone", "Thunder Stone Quarry"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/thunder-stone.html",
    title: "Thunder Stone Quarry | 4 Elements Affiliate",
    description:
      "Thunder Stone Quarry is a 4 Elements affiliate supplying aggregate support for trucking and construction projects in the Carlsbad, NM area.",
    eyebrow: "Affiliate",
    headingHtml: `Thunder Stone <span class="text-accent">Quarry</span>`,
    lead: "Affiliate quarry partner supporting aggregate materials for trucking and construction projects.",
    intro:
      "Thunder Stone Quarry supports 4 Elements trucking and construction jobs with aggregate materials coordinated from Carlsbad, New Mexico.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Purchasing",
            `<a href="mailto:${SHARED.purchasingEmail}">${SHARED.purchasingEmail}</a> / <a href="tel:+15759885351">${SHARED.purchasingPhone}</a>`,
          ],
        ]),
        `<section class="page-section">
            <h2>About</h2>
            <p class="page-intro">Thunder Stone Quarry is listed among the 4 Elements affiliate partners. On construction jobs, 4 Elements can source quarry materials together with trucking, safety techs, and project management under a single bid. Contact the office for material and delivery coordination.</p>
          </section>`,
        relatedSection([
          ["/divisions/trucking", "Trucking Division"],
          ["/divisions/construction", "Construction Division"],
        ]),
      ].join("\n"),
  },
  {
    file: "affiliates/droneops.html",
    title: "DroneOps Solutions | 4 Elements Affiliate",
    description:
      "DroneOps Solutions, LLC is a 4 Elements Oilfield Services LLC affiliate partner. Contact the Carlsbad, NM office for current capabilities.",
    eyebrow: "Affiliate",
    headingHtml: `DroneOps <span class="text-accent">Solutions</span>`,
    lead: "DroneOps Solutions, LLC - affiliate partner of 4 Elements Oilfield Services LLC.",
    intro:
      "DroneOps Solutions, LLC is listed among the 4 Elements affiliates. Contact the Carlsbad office for current capabilities and project coordination.",
    quoteHref: null,
    body: () =>
      [
        contactBlock([
          [
            "Office",
            `<a href="tel:${SHARED.officeTel}">${SHARED.officePhone}</a>`,
          ],
          ["Address", SHARED.address],
          [
            "Purchasing",
            `<a href="mailto:${SHARED.purchasingEmail}">${SHARED.purchasingEmail}</a> / <a href="tel:+15759885351">${SHARED.purchasingPhone}</a>`,
          ],
        ]),
        `<section class="page-section">
            <h2>About</h2>
            <p class="page-intro">DroneOps Solutions, LLC is listed among the 4 Elements affiliate partners. Contact our Carlsbad office for current capabilities and project coordination.</p>
          </section>`,
        relatedSection([
          ["/divisions/construction", "Construction Division"],
          ["/divisions/safety", "Safety Division"],
        ]),
      ].join("\n"),
  },
];

for (const p of pages) {
  const html = shell({
    file: p.file,
    title: p.title,
    description: p.description,
    eyebrow: p.eyebrow,
    headingHtml: p.headingHtml,
    lead: p.lead,
    intro: p.intro,
    quoteHref: p.quoteHref,
    bodyHtml: p.body(),
  });
  const out = path.join(root, p.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
  console.log("Wrote", p.file);
}

console.log("Done:", pages.length, "pages");
