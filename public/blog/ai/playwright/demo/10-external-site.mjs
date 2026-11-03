// LESSON: Playwright can open ANY site on the real internet, not just this one — the
// whole web is reachable. But not every site wants to be embedded inside another
// page (a bank doesn't want its login form living inside someone else's iframe, for
// example). A site says "don't embed me" with two response headers: X-Frame-Options
// and the CSP's frame-ancestors rule. This script visits two real sites at two
// widths each (four pictures) and prints those two headers for each.
// Run it from the repo root: node public/blog/ai/playwright/demo/10-external-site.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sites = [
	{ name: "example", url: "https://example.com/" },
	{ name: "mdn", url: "https://developer.mozilla.org/" },
];
const widths = [400, 1920];

const browser = await pw.chromium.launch();

for (const site of sites){
	const page = await browser.newPage({ viewport: { width: widths[0], height: 900 } });
	// waitUntil "load" (not "networkidle") — some sites long-poll and networkidle never fires.
	const res = await page.goto(site.url, { waitUntil: "load", timeout: 45000 }).catch(e => {
		console.log(site.name, "FAILED:", String(e).split("\n")[0]);
		return null;
	});
	if (!res){ await page.close(); continue; }
	await page.waitForTimeout(1500); // a short settle instead of waiting on network idle

	const h = res.headers();
	console.log(site.name, "x-frame-options:", h["x-frame-options"] ?? "(not set)");
	console.log(site.name, "frame-ancestors:", (h["content-security-policy"] ?? "").match(/frame-ancestors[^;]*/)?.[0] ?? "(not set)");

	for (const width of widths){
		await page.setViewportSize({ width, height: 900 });
		await page.waitForTimeout(300);
		const file = join(here, `10-external-site-${site.name}-${width}.jpg`);
		await page.screenshot({ path: file, type: "jpeg", quality: 70 });
		console.log(site.name, width, "->", file);
	}
	await page.close();
}

await browser.close();
