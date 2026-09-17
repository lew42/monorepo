// LESSON: Playwright sits BETWEEN the page and the internet — every request the page
// makes (for an image, a font, a script, some JSON) passes through Playwright first,
// and you can watch it, change it, or stop it before it ever leaves the computer.
// This script does three things: lists every request's type and size, BLOCKS every
// image so the page loads without any, and MOCKS one JSON request with fake data the
// page never actually asked a real server for.
// Run it from the repo root: node public/blog/ai/playwright/demo/06-network.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const log = []; // one line per response: its resource type and byte size
page.on("response", async r => {
	const type = r.request().resourceType();
	const body = await r.body().catch(() => Buffer.alloc(0)); // some responses have no body
	log.push(`${type.padEnd(10)} ${String(body.length).padStart(7)}b  ${r.url().slice(0, 70)}`);
});
// page.route intercepts a request before it goes out. Here: cancel every image.
// (This site also loads a font by fetching it from JS with no error handling — abort
// THAT and the whole page goes blank white instead of just losing a picture, a real
// trap worth knowing: blocking a resource type can break more than you meant to.)
await page.route("**/*", route => {
	const type = route.request().resourceType();
	if (type === "image") return route.abort(); // stop it — no bytes ever come back
	return route.continue(); // let everything else through unchanged, fonts included
});
// Mock one URL: whoever calls it gets OUR fake JSON, never a real answer.
await page.route("**/mock-data.json", route => route.fulfill({
	status: 200,
	contentType: "application/json",
	body: JSON.stringify({ mocked: true, note: "this never touched a real server" }),
}));
await page.goto("http://localhost:8123/notes/", { waitUntil: "load" }); // a page full of real photographed images
await page.waitForTimeout(600);
await page.screenshot({ path: join(here, "06-network-images-blocked.jpg"), type: "jpeg", quality: 70 });
// Prove the mock: ask the page to fetch a URL nothing real serves — it still gets an
// answer, the fake one Playwright handed back instead.
const mocked = await page.evaluate(() => fetch("/mock-data.json").then(r => r.json()));
console.log("mocked fetch returned:", JSON.stringify(mocked));
console.log(`\n${log.length} real responses (images never appear — aborted before any response came back):`);
console.log(log.slice(0, 15).join("\n"));
await browser.close();
