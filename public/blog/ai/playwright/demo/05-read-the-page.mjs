// LESSON: a page is not just a picture — it is DATA you can read with code. Playwright
// can ask a live page "what are your headings, links and landmarks, and how is each
// one laid out?" and get back plain JavaScript values. One trap: a stylesheet from a
// DIFFERENT origin can BLOCK you from reading its rules directly (`cssRules` throws)
// — a security rule so one site can't spy on another's CSS file. The fix: watch the
// network responses go by and grab the CSS text as it arrives. No picture — just JSON.
// Run it from the repo root: node public/blog/ai/playwright/demo/05-read-the-page.mjs
import pw from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.js";

const browser = await pw.chromium.launch();
// Part 1: read this site's own home page — its headings and how many links it has.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:8123/", { waitUntil: "load" });
await page.waitForTimeout(500);
const read = await page.evaluate(() => ({
	headings: [...document.querySelectorAll("h1, h2, h3")].map(h => h.tagName + ": " + h.textContent.trim().slice(0, 40)),
	linkCount: document.querySelectorAll("a[href]").length,
}));
console.log(JSON.stringify(read, null, 1));
await page.close();

// Part 2: a real-world page for landmarks + computed layout, and the CSSOM trap.
// (stripe.com, not MDN — MDN's stylesheets carry permissive CORS headers and read
// fine cross-origin; stripe.com's don't, so it actually reproduces the trap.)
const cssBytes = [];
const other = await browser.newPage();
other.on("response", async r => { if ((r.headers()["content-type"] ?? "").includes("text/css")) cssBytes.push((await r.text().catch(() => "")).length); });
await other.goto("https://stripe.com/", { waitUntil: "load", timeout: 45000 });
await other.waitForTimeout(1500); // let long-polling settle instead of waiting on networkidle
const landmarks = await other.evaluate(() => [...document.querySelectorAll("header, nav, main, aside, footer")].map(el => {
	const cs = getComputedStyle(el); // the FINAL computed style, after every CSS rule has applied
	return { tag: el.tagName.toLowerCase(), display: cs.display, gridCols: cs.gridTemplateColumns.slice(0, 30), flexDir: cs.flexDirection };
}));
console.log("stripe.com landmarks + computed layout:", JSON.stringify(landmarks, null, 1));

// The trap: try each stylesheet's rules one by one — SOME throw (blocked), some don't.
const cssomCheck = await other.evaluate(() => {
	let ok = 0, blocked = 0;
	for (const sheet of document.styleSheets){ try { sheet.cssRules; ok++; } catch { blocked++; } }
	return { ok, blocked };
});
console.log("CSSOM direct read — ok:", cssomCheck.ok, "blocked (threw):", cssomCheck.blocked);
console.log("Fix — CSS captured from network responses instead:", cssBytes.length, "stylesheets,", cssBytes.reduce((a, b) => a + b, 0), "bytes");
await other.close();
await browser.close();
