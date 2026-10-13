// What the site's spacing and type tokens compute to at 390 / 1440 / 1920 / 3440, to compare with Figma's modes.
// Run: node public/framework/ext/Figma/tokens/measure.mjs [url]   (uses Server/browser.mjs; prints one line per width)
import { browser as shared, close } from "../../../../../Server/browser.mjs";

const url = process.argv[2] || "http://monorepo.localhost/framework/ui/card/";
const page = await (await shared()).newPage();
for (const width of [390, 1440, 1920, 3440]) {
	await page.setViewportSize({ width, height: 1000 });
	await page.goto(url, { waitUntil: "networkidle" });
	await page.waitForTimeout(1000);
	const r = await page.evaluate(() => {
		const host = document.querySelector(".page-content") || document.querySelector("main") || document.body;
		const px = token => { const d = document.createElement("div"); d.style.cssText = `position:relative;visibility:hidden;width:100%;padding-top:var(--${token})`; host.appendChild(d); const v = parseFloat(getComputedStyle(d).paddingTop); d.remove(); return Math.round(v * 10) / 10; };
		const size = sel => { const e = document.querySelector(sel); return e ? parseFloat(getComputedStyle(e).fontSize) : null; };
		const card = document.querySelector(".card"); const cs = card && getComputedStyle(card);
		return { pad: px("pad"), "pad-card": px("pad-card"), gap: px("gap"), flow: px("flow"), body: parseFloat(getComputedStyle(document.body).fontSize), h1: size("h1"), h2: size("h2"), h3: size("h3"), h4: size("h4"), card: cs && `${cs.paddingTop}/${cs.paddingLeft} r${cs.borderRadius}` };
	});
	console.log(JSON.stringify({ width, ...r }));
}
await page.close();
await close();
