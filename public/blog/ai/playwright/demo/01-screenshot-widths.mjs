// LESSON: a "viewport" is just a pretend window size — a number of pixels wide and
// tall that you tell the browser to pretend it has. Real phones, laptops and big
// monitors all have different widths, so a page has to work at all of them. This
// script opens the SAME page four times, each time at a different pretend window
// size, and takes a picture each time — so you can see one page reflow four ways.
// Run it from the repo root: node public/blog/ai/playwright/demo/01-screenshot-widths.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)); // this folder — pictures land beside the script
const url = "http://localhost:8123/"; // the site's home page

// The four widths to try: a phone, a laptop, a full-HD monitor, an ultrawide monitor.
const widths = [
	{ name: "phone", width: 400, height: 844 },
	{ name: "laptop", width: 1280, height: 800 },
	{ name: "desktop", width: 1920, height: 1080 },
	{ name: "ultrawide", width: 3440, height: 1440 },
];

const browser = await pw.chromium.launch(); // start one headless Chrome

for (const vp of widths){
	const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } }); // set the pretend window size
	await page.goto(url, { waitUntil: "load" }); // open the page
	await page.waitForTimeout(500); // let layout and fonts settle
	const file = join(here, `01-screenshot-widths-${vp.name}.jpg`);
	await page.screenshot({ path: file, type: "jpeg", quality: 70 }); // take the picture
	console.log(vp.name, `${vp.width}x${vp.height}`, "->", file);
	await page.close();
}

await browser.close(); // always close the browser when done
