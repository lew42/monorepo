// LESSON: to Playwright, "a phone" isn't a different browser — it's just a bundle of
// settings on the same Chrome: a small screen, touch instead of a mouse, a light-or-
// dark preference, and whether the OS says "reduce motion". Playwright ships a list
// of real device presets (`pw.devices["iPhone 13"]`) so you don't have to guess those
// numbers yourself. This script loads the home page as an iPhone 13 twice: once
// asking for light mode, once for dark, to show the same settings bundle driving both.
// Run it from the repo root: node public/blog/ai/playwright/demo/04-emulate-phone.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const iphone = pw.devices["iPhone 13"]; // width, height, pixel ratio, "isMobile", "hasTouch", the real user agent string
console.log("iPhone 13 preset:", iphone.viewport, "touch:", iphone.hasTouch, "mobile:", iphone.isMobile);

const browser = await pw.chromium.launch();

for (const scheme of ["light", "dark"]){
	const context = await browser.newContext({
		...iphone, // spread the whole device preset: viewport, user agent, touch, mobile
		colorScheme: scheme, // ask the page for light or dark mode, like a phone's system setting
		reducedMotion: "reduce", // ask the page to skip/shorten animations, like a phone's accessibility setting
	});
	const page = await context.newPage();
	await page.goto("http://localhost:8123/", { waitUntil: "load" });
	await page.waitForTimeout(500);
	const file = join(here, `04-emulate-phone-${scheme}.jpg`);
	await page.screenshot({ path: file, type: "jpeg", quality: 70 });
	console.log(scheme, "->", file);
	await context.close();
}

await browser.close();
