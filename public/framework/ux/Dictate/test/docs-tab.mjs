// The Docs tab, proven: opens the Docs view, sees the readme's heading and its "How messages travel" section, opens one doc
// (settings.md), sees its heading, clicks back; shot at 400 and 1920.
//   node public/framework/ux/Dictate/test/docs-tab.mjs <base-url> <shots dir>
// Headless; nothing is posted. Exit 1 on any failure.
import fs from "fs";

const [base = "http://monorepo.localhost", shots = "."] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);
const browser = await Browser.launch({});
const kill = setTimeout(() => { console.log("FAIL killed after 120 s"); process.exit(2); }, 120000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const heading = page => page.evaluate(() => [...document.querySelectorAll(".dictate-docs-body h1")].find(e => e.offsetParent)?.textContent ?? null);

for (const [w, h] of [[400, 844], [1920, 1000]]){
	const ctx = await browser.newContext({ viewport: { width: w, height: h } });
	const page = await ctx.newPage();
	const errors = [];
	page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	await page.goto(base + "/framework/ext/drawer/ai/docs/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".dictate-docs-body h1", { timeout: 20000 }).catch(() => {});
	const h1 = await heading(page);
	check(/^Dictate/.test(h1 ?? ""), `${w}: the readme's heading shows (${h1})`);
	check(await page.evaluate(() => document.querySelectorAll('.dictate-docs-body:not([hidden]) sup a[href^="#fn"]').length >= 8), `${w}: footnote marks are links`);
	await page.locator('.dictate-docs-list a:visible', { hasText: "How messages travel" }).first().click();
	check(new URL(page.url()).pathname === "/framework/ext/drawer/ai/docs/", `${w}: the top link stays in the tab`);
	check(await page.evaluate(() => [...document.querySelectorAll(".dictate-docs-body h2")].some(x => x.textContent === "How messages travel")), `${w}: "How messages travel" is in the readme`);
	await page.screenshot({ path: `${shots}/docs-${w}.png` });
	await page.locator('.dictate-docs-list a:visible', { hasText: 'Settings' }).first().click();
	await page.waitForFunction(() => /settings panel/i.test([...document.querySelectorAll(".dictate-docs-body h1")].find(e => e.offsetParent)?.textContent ?? ""), null, { timeout: 10000 }).catch(() => {});
	const h2 = await heading(page);
	check(/settings panel/i.test(h2 ?? ""), `${w}: the settings doc opens in the tab (${h2})`);
	await page.screenshot({ path: `${shots}/docs-doc-${w}.png` });
	check(new URL(page.url()).pathname === "/framework/ext/drawer/ai/docs/", `${w}: the url did not leave the tab`);
	await page.locator('.dictate-docs-back:visible').click();
	await page.waitForFunction(() => /^Dictate/.test([...document.querySelectorAll(".dictate-docs-body h1")].find(e => e.offsetParent)?.textContent ?? ""), null, { timeout: 10000 }).catch(() => {});
	check(/^Dictate/.test(await heading(page) ?? ""), `${w}: back shows the readme again`);
	// a .md link inside the text opens in place too
	await page.locator('.dictate-docs-body a[data-md$="/doc/debug-tab.md"]:visible').first().click();
	await page.waitForFunction(() => /Debug tab/.test([...document.querySelectorAll(".dictate-docs-body h1")].find(e => e.offsetParent)?.textContent ?? ""), null, { timeout: 10000 }).catch(() => {});
	check(/Debug tab/.test(await heading(page) ?? ""), `${w}: a link in the text opens in place`);
	check(!errors.length, `${w}: no page errors ${errors.join(" | ")}`);
	await ctx.close();
}
clearTimeout(kill);
await browser.close();
console.log(failed ? `${failed} FAIL` : "0 FAIL");
process.exit(failed ? 1 : 0);
