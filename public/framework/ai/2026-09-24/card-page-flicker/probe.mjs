// Usage: node probe.mjs <label>  — counts DOM mutations on the card page while a no-change update arrives.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
const label = process.argv[2] ?? "run";
const URL = "http://monorepo.localhost/framework/ai2/2026/09/24/layout-columns/";
const out = process.env.OUT ?? "C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/4c2b66ef-90c2-4a3d-9ab8-15a2aaf08704/scratchpad";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1000 } });
await ctx.addInitScript(() => { window.$BLOCKRELOAD = true; });
const page = await ctx.newPage();
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await ctx.addInitScript(() => { window.__sets = new Set(); const add = Set.prototype.add; Set.prototype.add = function(v){ if (typeof v === "function") window.__sets.add(this); return add.call(this, v); }; });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const install = () => page.evaluate(() => {
	window.__m = [];
	const d = n => (n.nodeType === 1 ? n.tagName + "." + (n.className || "").toString().split(" ")[0] : "#text");
	window.__mo?.disconnect();
	window.__mo = new MutationObserver(rs => rs.forEach(r => window.__m.push({
		t: r.type, target: d(r.target), add: [...r.addedNodes].map(d).length, rem: [...r.removedNodes].map(d).length,
		attr: r.attributeName || null,
	})));
	window.__mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
});
const read = () => page.evaluate(() => {
	const ms = window.__m; const by = {};
	ms.forEach(m => { const k = `${m.t} ${m.target}${m.attr ? " @" + m.attr : ""} +${m.add}/-${m.rem}`; by[k] = (by[k] ?? 0) + 1; });
	return { total: ms.length, childList: ms.filter(m => m.t === "childList").length, by };
});
const res = { label };
// 1. baseline: 8s of idle (polls, streams) with nothing changing
await install(); await page.waitForTimeout(8000); res.idle8s = await read();
// 2. no-change update: fire every reader the page registered (cards/groups/agents) with nothing changed
await install();
res.readersFired = await page.evaluate(() => { let n = 0; (window.__sets ?? []).forEach(s => [...s].forEach(f => { try { f(); n++; } catch {} })); return n; });
await page.waitForTimeout(1500);
res.noChange = await read();
res.hasHook = await page.evaluate(() => typeof window.app);
await page.waitForTimeout(200);
fs.writeFileSync(`${out}/probe-${label}.json`, JSON.stringify({ ...res, errors }, null, 1));
await page.screenshot({ path: `${out}/card-${label}.png` });
console.log(JSON.stringify({ ...res, errors }, null, 1));
await b.close();
