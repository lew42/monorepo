import { browser as get_browser } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const base = process.argv[2];
const b = await get_browser();
const page = await (await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true })).newPage();
const errs = []; page.on("pageerror", e => errs.push(String(e)));
const es = []; page.on("request", r => { if (/\/stream$/.test(r.url())) es.push(r.url().slice(-50)); });
await page.goto(base + "/framework/audio/Recite/", { waitUntil: "networkidle" });   // a fresh tab, no session of its own
await page.waitForTimeout(3000);
const links = await page.evaluate(async () => {
	const { md_into } = await import("/framework/ext/Chat/md.js");
	const d = document.createElement("div");
	md_into(d, "[a](https://monorepo.lew42.com/framework/ai/?site_key=SECRET#x) [b](/framework/) [c](https://example.com/) [d](http://monorepo.localhost/web/)");
	return [...d.querySelectorAll("a")].map(a => [a.getAttribute("href"), a.getAttribute("target")]);
});
console.log("links", JSON.stringify(links));
await page.tap(".drawer-rail-ai"); await page.waitForTimeout(2500);
const bar = await page.evaluate(() => { const b = document.querySelector(".drawer-rail-sheet .audio-recite-wrap"); const r = b?.getBoundingClientRect(); return b ? [Math.round(r.top), Math.round(r.height)] : null; });
const tr = await page.evaluate(async () => { const R = (await import("/framework/audio/Recite/Recite.js")).default; return { loaded: !!R._shared, follow: typeof document.querySelector }; }); console.log("recite", JSON.stringify(tr));
console.log("streams", es.join(" | ")); console.log("bar in sheet", JSON.stringify(bar)); console.log("errors", errs);
await b.close?.();
