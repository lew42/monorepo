// LESSON: pixels are for human eyes. An AI agent (or a screen reader) reads a page
// differently — as a TREE of roles and names: "heading: A web framework", "link:
// Framework", "button: Menu". Playwright can print that exact tree with one call,
// ariaSnapshot(). This is not a side feature: it is literally how @playwright/mcp
// lets an AI drive a browser without ever looking at a picture — the tree below is
// what such an agent "sees" instead of the screenshot beside it.
// Run it from the repo root: node public/blog/ai/playwright/demo/09-aria-snapshot.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://localhost:8123/", { waitUntil: "load" });
await page.waitForTimeout(500);

await page.screenshot({ path: join(here, "09-aria-snapshot.jpg"), type: "jpeg", quality: 70 }); // what a human sees
const tree = await page.locator("body").ariaSnapshot(); // what an agent "sees" instead

console.log("--- what a human sees: the screenshot beside this file ---");
console.log("--- what an agent reads: the aria snapshot below ---\n");
console.log(tree.slice(0, 1600)); // the first slice — the real tree is much longer

await browser.close();
