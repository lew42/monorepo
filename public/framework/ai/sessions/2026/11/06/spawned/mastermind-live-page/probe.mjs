// Probe for /live/ (LivePage): opens it headless, shoots light and dark, then times each test delta from the
// moment the item tool is asked (POST /api/item, the same writer the MCP `item` tool uses) to the DOM changing.
// node probe.mjs [--shots-only]   Results: probe.json and shots/ beside this file.
import { writeFileSync, mkdirSync } from "node:fs";
import { browser as launch, close } from "../../../../../../../../../Server/Browser.mjs";
import { fileURLToPath } from "node:url";

const SITE = "http://monorepo.localhost/live/", API = "http://localhost/api/item";
const out = new URL("./", import.meta.url), shots = new URL("./shots/", out);
mkdirSync(shots, { recursive: true });

const item = async delta => {
	const r = await fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: "/live/", delta }) });
	return r.json();
};

const browser = await launch();
const errors = [];
const open = async (scheme, width = 400) => {
	const page = await browser.newPage({ colorScheme: scheme, viewport: { width, height: 800 } });
	page.on("console", m => { if (m.type() === "error") errors.push(`${scheme}: ${m.text()}`); });
	page.on("pageerror", e => errors.push(`${scheme}: ${e.message}`));
	await page.goto(SITE, { waitUntil: "networkidle" });
	await page.waitForSelector(".live-page");
	return page;
};

const report = { errors, steps: [] };
const page = await open("light");
// Every DOM change under the page, with its wall-clock time (same clock as this script).
await page.evaluate(() => {
	window.__muts = [];
	new MutationObserver(() => window.__muts.push(performance.timeOrigin + performance.now()))
		.observe(document.querySelector(".live-page"), { subtree: true, childList: true, attributes: true, characterData: true });
});

if (!process.argv.includes("--shots-only")){
	const steps = [
		["clear", { content: { clear: true } }],
		["add card", { content: { add: { type: "part-card", id: "probe1", title: "Hello", text: "First card, from the probe." } } }],
		["add second card", { content: { add: { type: "part-card", id: "probe2", title: "Second", text: "- one\n- two" } } }],
		["edit card", { content: { probe1: { text: "Edited in place." } } }],
		["light on", { light: true }],
		["light off", { light: false }],
		["toggle", { toggle: {} }],
		["flash", { flash: {} }],
		["alert", { alert: "Hello from the probe" }],
		["header", { header: "A line under the title" }],
		["footer", { footer: "A line at the bottom" }],
		["remove card", { content: { remove: "probe2" } }],
	];
	for (const [name, delta] of steps){
		await page.evaluate(() => { window.__muts = []; });
		const t0 = Date.now();
		const answer = await item(delta);
		const t_tool = Date.now();
		let first = null;
		for (let i = 0; i < 100 && !first; i++){ await page.waitForTimeout(10); first = await page.evaluate(() => window.__muts[0] ?? null); }
		report.steps.push({ name, delta, ok: answer.ok, why: answer.why, tool_ms: t_tool - t0, screen_ms: first ? Math.round(first - t0) : null });
		await page.waitForTimeout(150);
	}
	await page.screenshot({ path: fileURLToPath(new URL("live-after-light.png", shots)) });
}
await page.screenshot({ path: fileURLToPath(new URL("live-400-light.png", shots)), fullPage: true });
const dark = await open("dark");
await dark.screenshot({ path: fileURLToPath(new URL("live-400-dark.png", shots)), fullPage: true });
const wide = await open("light", 1920);
await wide.screenshot({ path: fileURLToPath(new URL("live-1920-light.png", shots)) });
report.colors = await dark.evaluate(() => {
	const c = el => el && getComputedStyle(el);
	return { floor: c(document.querySelector(".live-page"))?.backgroundColor, card: c(document.querySelector(".live-card"))?.backgroundColor, ink: c(document.querySelector(".live-card"))?.color };
});
await close();
const ms = report.steps.map(s => s.screen_ms).filter(n => n != null).sort((a, b) => a - b);
report.summary = ms.length ? { n: ms.length, median: ms[ms.length >> 1], min: ms[0], max: ms.at(-1) } : null;
writeFileSync(new URL("probe.json", out), JSON.stringify(report, null, "\t") + "\n");
console.log(JSON.stringify(report, null, 1));
