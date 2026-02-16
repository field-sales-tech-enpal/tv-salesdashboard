import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "docs", "shots");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Your Looker Studio embed pages:
const PAGES = [
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/kMFmF",
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/p_9j0kd2f9zd",
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/p_mql5w6hc0d",
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/p_dl20oeic0d",
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/p_pnjbc5kc0d",
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/p_3pifgdlc0d",
  "https://lookerstudio.google.com/embed/reporting/8d1bd4f1-48eb-4ab3-a749-20fb4f0cbc1a/page/p_i1q8nglc0d"
];

// TV resolution
const VIEWPORT = { width: 1920, height: 1080 };

// Wait after page load for charts to finish rendering
const RENDER_WAIT_MS = 12000;

// Page navigation timeout
const NAV_TIMEOUT_MS = 180000;

function fname(i) {
  return `slide-${String(i + 1).padStart(2, "0")}.png`;
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1
});
const page = await context.newPage();

for (let i = 0; i < PAGES.length; i++) {
  const url = PAGES[i];
  const out = path.join(OUT_DIR, fname(i));

  console.log(`Loading ${i + 1}/${PAGES.length}: ${url}`);

  // Looker often never reaches networkidle; domcontentloaded is safer
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });

  // Let Looker render charts
  await page.waitForTimeout(RENDER_WAIT_MS);

  await page.screenshot({ path: out, fullPage: false });
  console.log(`Saved ${out}`);
}

await browser.close();

// Manifest for slideshow
const manifest = PAGES.map((_, i) => ({ file: `shots/${fname(i)}` }));
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Wrote docs/shots/manifest.json");
