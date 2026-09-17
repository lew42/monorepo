// LESSON: Playwright can act on a page like a person — click a button, type into a
// box — and it WAITS. A real browser needs a moment for things to appear (a menu
// sliding open, a font loading); Playwright's .click() and .type() pause on their
// own until the target actually exists and is visible, instead of failing the way a
// script that just "sends a click" at the wrong instant would. This script clicks
// into a real text box on this site's task board and types a sentence into it —
// never pressing a submit button, so nothing is actually sent anywhere.
// Run it from the repo root: node public/blog/ai/playwright/demo/03-click-and-type.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://localhost:8123/framework/ai/", { waitUntil: "load" }); // the AI task index
await page.waitForTimeout(600);
await page.screenshot({ path: join(here, "03-click-and-type-before.jpg"), type: "jpeg", quality: 70 }); // before: the box is empty

const box = page.locator(".ai-compose-input"); // the "what should Claude work on?" text box
await box.click(); // Playwright waits for it to be clickable, then clicks
await box.pressSequentially("Ten small Playwright demos — this line only proves typing works.", { delay: 15 }); // types like a person, one key at a time
await page.waitForTimeout(300);
await page.screenshot({ path: join(here, "03-click-and-type-after.jpg"), type: "jpeg", quality: 70 }); // after: the sentence sits in the box, untouched otherwise

console.log("clicked and typed, never submitted");
await browser.close();
