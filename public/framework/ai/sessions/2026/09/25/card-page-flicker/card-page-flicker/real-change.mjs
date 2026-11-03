import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1000 } });
await ctx.addInitScript(() => { window.$BLOCKRELOAD = true; });
const page = await ctx.newPage();
let change = false, changed = null;
await page.route(/\/cards\?view=all/, async route => {
	const res = await route.fetch(); const list = await res.json();
	if (change){ const c = list.find(c => c.id === "2026/09/24/layout-columns") ?? list[0]; c.title = "CHANGED TITLE"; changed = c.id; }
	await route.fulfill({ response: res, json: list });
});
await page.goto("http://monorepo.localhost/framework/ai2/2026/09/24/layout-columns/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.evaluate(() => {
	window.__m = [];
	const d = n => (n.nodeType === 1 ? n.tagName + "." + (n.className || "").toString().split(" ")[0] : "#text");
	new MutationObserver(rs => rs.forEach(r => window.__m.push(`${r.type} ${d(r.target)} +${r.addedNodes.length}/-${r.removedNodes.length}`)))
		.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
});
change = true;
await page.waitForTimeout(23000);
const m = await page.evaluate(() => window.__m);
const by = {}; m.forEach(k => by[k] = (by[k] ?? 0) + 1);
console.log(JSON.stringify({ changed, total: m.length, by }, null, 1));
await page.screenshot({ path: "C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/4c2b66ef-90c2-4a3d-9ab8-15a2aaf08704/scratchpad/card-1920.png" });
await b.close();
