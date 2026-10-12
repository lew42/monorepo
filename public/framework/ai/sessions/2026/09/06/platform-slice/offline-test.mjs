// offline-test.mjs — the acceptance test the whole platform rests on
// (mvp step 4): turn the Worker off, browse the site, every page still renders.
// :8097 is plain `node server.js` — no worker, no D1, no /api/* at all.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:8097";
const TOPIC = "/imagine/platform/topic/";
const OUT = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));

const fails = [];
const check = (label, ok, got) => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${got === undefined ? "" : `  (${got})`}`);
    if (!ok) fails.push(label);
};

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));

await page.goto(BASE + TOPIC, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const btn = page.locator(".platform-like").first();
check("the page rendered with no worker anywhere", await page.locator("h1, .page").count() > 0);
check("the like button is there", await btn.count() === 1);
check("it says it is offline, not a number", (await btn.textContent()).includes("—"), (await btn.textContent()).trim());
check("it is disabled", await btn.isDisabled());
check("the topic's own content still renders", (await page.textContent("body")).includes("Ten minutes"));
check("nothing threw", errors.length === 0, errors.join(" | ") || "no page errors");

await page.screenshot({ path: path.join(OUT, "slice-offline.png") });
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : "\nall passed");
process.exit(fails.length ? 1 : 0);
