// Headless shot script for the tabs-panel fix — never drives the owner's tabs.
// Usage: node shoot.mjs <tag>   (tag = "before" or "after")
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const tag = process.argv[2] || "after";
const base = "http://localhost:8095";
const outDir = `C:/Code/lew42/monorepo/scratchpad/tabs-panel/shots`;
mkdirSync(outDir, { recursive: true });

const pages = [
	{ slug: "panel-doc",  path: "/framework/ext/Panel/" },
	{ slug: "core-page",  path: "/framework/core/Page/" },
	{ slug: "mag",        path: "/imagine/mag/" },
	{ slug: "blog-post",  path: "/blog/systems/layout-generators/" },
	{ slug: "swap-ref",   path: "/imagine/paging/mechanisms/swap/" },
	{ slug: "tabs-doc",   path: "/framework/ext/tabs/" },
];
const widths = [1280, 3440];

const browser = await chromium.launch();
const errors = [];

for (const { slug, path } of pages){
	for (const width of widths){
		const context = await browser.newContext({ viewport: { width, height: 1000 } });
		const page = await context.newPage();
		const consoleErrors = [];
		page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
		page.on("pageerror", err => consoleErrors.push(String(err)));

		await page.goto(base + path, { waitUntil: "networkidle" });
		await page.waitForTimeout(400); // reveal()/loaders settle

		const file = `${outDir}/${slug}-${width}-${tag}.png`;
		await page.screenshot({ path: file, fullPage: false });

		if (consoleErrors.length){
			errors.push({ slug, width, tag, consoleErrors });
			console.log(`ERRORS ${slug} ${width} ${tag}:`, consoleErrors);
		} else {
			console.log(`ok ${slug} ${width} ${tag} -> ${file}`);
		}
		await context.close();
	}
}

await browser.close();
if (errors.length){
	console.log("\nTOTAL ERROR PAGES:", errors.length);
	process.exitCode = 1;
} else {
	console.log("\nzero console errors across all shots");
}
