// shot-clear.mjs — crop-screenshot the first preview row's × (archive) button, hovered,
// to prove its alignment. Usage: node shot-clear.mjs <url> <width> <out.png>
import { browser, close } from "../../../../../../Server/browser.mjs";

const [url, widthArg, out, mode] = process.argv.slice(2);
const width = Number(widthArg) || 1920;
if (!url || !out) { console.error("usage: node shot-clear.mjs <url> <width> <out.png> [hover|plain]"); process.exit(1); }

const b = await browser();
const page = await (await b.newContext({ viewport: { width, height: 1080 } })).newPage();
await page.goto(url, { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));

const row = page.locator(".ai2-row:not(.ai2-row-ask):not(.ai2-row-live) .ai2-clear").first();
await row.waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
if (mode !== "plain"){
	await row.hover().catch(() => {});
	await new Promise(r => setTimeout(r, 150));
}

const rowHead = page.locator(".ai2-row:not(.ai2-row-ask):not(.ai2-row-live) .ai2-row-head").first();
const box = await rowHead.boundingBox().catch(() => null);
if (box){
	const pad = 12;
	await page.screenshot({ path: out, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 } });
} else {
	await page.screenshot({ path: out });
}
console.log("wrote", out);
await close();
