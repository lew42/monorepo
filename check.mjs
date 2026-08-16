import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";

const urls = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
let bad = 0;

for (const url of urls){
	const errors = [];
	page.removeAllListeners("console");
	page.removeAllListeners("pageerror");
	page.on("console", m => m.type() === "error" && errors.push(m.text()));
	page.on("pageerror", e => errors.push("PAGEERROR " + e.message));

	await page.goto("http://localhost" + url, { waitUntil: "networkidle" }).catch(e => errors.push("GOTO " + e.message));
	await page.waitForTimeout(600);

	const info = await page.evaluate(() => ({
		tabs: [...document.querySelectorAll(".page.doc-page > .tabs > .tab-bar > .tab")].map(t => t.textContent.trim()),
		title: document.querySelector(".doc-title")?.textContent?.trim(),
		mderr: [...document.querySelectorAll(".md-error")].map(e => e.textContent.trim()).slice(0, 3),
		overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
	}));

	if (errors.length) bad++;
	console.log(`${errors.length ? "FAIL" : "ok  "} ${url}  [${info.title ?? "-"}]  tabs=${JSON.stringify(info.tabs)}${info.overflow ? "  OVERFLOW" : ""}`);
	errors.slice(0, 4).forEach(e => console.log("      " + e.slice(0, 200)));
	info.mderr.forEach(e => console.log("      md: " + e.slice(0, 120)));
}

await browser.close();
process.exit(bad ? 1 : 0);
