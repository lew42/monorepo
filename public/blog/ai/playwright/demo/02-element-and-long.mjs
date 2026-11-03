// LESSON: you don't have to screenshot the whole page. Playwright can shoot ONE
// element (find it, then call .screenshot() on just that piece) — handy for a bug
// report of one button, not the whole screen. It can also open a window taller than
// any real screen, so a long page fits in a single picture without scrolling. This
// script does both: one small picture of just the page's big heading, and one tall
// picture of the whole blog list.
// Run it from the repo root: node public/blog/ai/playwright/demo/02-element-and-long.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const browser = await pw.chromium.launch();

// Part 1: an element screenshot. Open the home page, find the <h1>, shoot only it.
const page1 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page1.goto("http://localhost:8123/", { waitUntil: "load" });
await page1.waitForTimeout(500);
const heading = page1.locator("h1").first(); // the big headline text on the home page
await heading.screenshot({ path: join(here, "02-element-and-long-element.jpg"), type: "jpeg", quality: 70 });
console.log("element shot of <h1> done");
await page1.close();

// Part 2: a "long" shot. Make the pretend window itself 4000px tall (not a real
// screen size, but Playwright doesn't care) so a long page's whole length lands in
// one picture instead of many scrolled screenfuls.
const page2 = await browser.newPage({ viewport: { width: 1280, height: 4000 } });
await page2.goto("http://localhost:8123/notes/", { waitUntil: "load" }); // the notes wall — dozens of cards, naturally long
await page2.waitForTimeout(500);
await page2.screenshot({ path: join(here, "02-element-and-long-long.jpg"), type: "jpeg", quality: 70 });
console.log("4000px-tall shot of /notes/ done");
await page2.close();

await browser.close();
