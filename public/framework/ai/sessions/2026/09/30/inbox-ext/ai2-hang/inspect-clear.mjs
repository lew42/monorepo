import { browser, close } from "../../../../../../Server/browser.mjs";
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));
const info = await page.evaluate(() => {
	const el = document.querySelector(".ai2-row:not(.ai2-row-ask):not(.ai2-row-live) .ai2-clear");
	if (!el) return null;
	const cs = getComputedStyle(el);
	return {
		outerHTML: el.outerHTML,
		parentClass: el.parentElement.className,
		rect: el.getBoundingClientRect().toJSON(),
		minHeight: cs.minHeight, minBlockSize: cs.minBlockSize, blockSize: cs.blockSize, height: cs.height,
		padding: cs.padding, border: cs.border, background: cs.backgroundColor, borderRadius: cs.borderRadius,
		alignSelf: cs.alignSelf, boxSizing: cs.boxSizing, lineHeight: cs.lineHeight,
	};
});
console.log(JSON.stringify(info, null, 2));
await close();
