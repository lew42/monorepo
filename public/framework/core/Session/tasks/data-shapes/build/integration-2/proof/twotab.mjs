// Two-tab page edit on the integration-2 worktree's dev server. usage: node twotab.mjs old|new
// old: posts go to the live Servex (old code), which stubs a worktree page's post, so the tab falls back to its dev server.
// new: posts to 127.0.0.1:8090/api/item are routed to an in-process entry point running THIS worktree's serve_item (the code a restart would load).
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs"; import http from "node:http";
const MODE = process.argv[2] ?? "old", WT = "C:/Code/lew42/worktrees/data-shapes-2", REL = "/framework/core/Page/tool/";
const FILE = `${WT}/public${REL}page.jsonl`, URL = "http://localhost:53219" + REL;
const lines = () => fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
let entry = null, posts = 0;
if (MODE === "new"){
	const { serve_item } = await import(`file:///${WT}/Servex/agents/page_tools.js`);
	const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "POST, OPTIONS", "content-type": "application/json" };
	const server = http.createServer((q, s) => { if (q.method === "OPTIONS"){ s.writeHead(204, cors); return s.end(); } let b = ""; q.on("data", d => b += d); q.on("end", async () => { posts++; const out = await serve_item(JSON.parse(b)); s.writeHead(200, cors); s.end(JSON.stringify(out)); }); });
	await new Promise(r => server.listen(0, "127.0.0.1", r)); entry = { server, url: `http://127.0.0.1:${server.address().port}/api/item` };
}
const browser = await chromium.launch(), ctx = await browser.newContext(), logs = [];
if (entry) await ctx.route("http://127.0.0.1:8090/api/item", async route => route.fulfill({ response: await route.fetch({ url: entry.url }) }));
const [A, B] = [await ctx.newPage(), await ctx.newPage()];
for (const [n, p] of [["A", A], ["B", B]]){ p.on("pageerror", e => logs.push(`${n} pageerror: ${e.message}`)); p.on("response", r => r.status() >= 400 && logs.push(`${n} HTTP ${r.status()} ${r.url()}`)); }
await A.goto(URL, { waitUntil: "load" }); await B.goto(URL, { waitUntil: "load" }); await A.waitForTimeout(2500);
const before = lines().length, out = { mode: MODE, before };
const shown = (p, text) => p.evaluate(t => [...document.querySelectorAll("main *, .page *, body *")].filter(e => !e.childElementCount && e.textContent.includes(t)).length, text);
const do_in_A = fn => A.evaluate(async src => { const R = (await import("/framework/core/Page/Reader.js")).default; const page = R.instances.get(location.pathname + "page.jsonl").host; return (0, eval)(src)(page); }, fn.toString());
const wait_lines = async n => { for (let i = 0; i < 40 && lines().length < n; i++) await A.waitForTimeout(250); await A.waitForTimeout(1500); return lines().length; };
const step = async (name, fn, text, n) => {
	const r = await do_in_A(fn); const got = await wait_lines(n);
	out[name] = { lines_added: got - (n - 1), last: lines().at(-1), shown_in_B: await shown(B, text), shown_in_A: await shown(A, text), r };
};
await step("add", page => { const p = page.content.add({ type: "part-text", text: "probe two-tab one" }); window._probe = p.id; return p.id; }, "probe two-tab one", before + 1);
await step("edit", page => { page.content.find(window._probe).set({ text: "probe two-tab edited" }); return true; }, "probe two-tab edited", before + 2);
await step("move", page => { const p = page.content.find(window._probe); page.content.move(p, { before: page.content.items[0] }); return page.content.items.map(x => x.id); }, "probe two-tab edited", before + 3);
out.order_in_B = await B.evaluate(async () => { const R = (await import("/framework/core/Page/Reader.js")).default; return R.instances.get(location.pathname + "page.jsonl").host.content.items.slice(0, 3).map(x => x.id); });
out.order_in_A = await A.evaluate(async () => { const R = (await import("/framework/core/Page/Reader.js")).default; return R.instances.get(location.pathname + "page.jsonl").host.content.items.slice(0, 3).map(x => x.id); });
out.total_added = lines().length - before; out.posts_to_new_entry = posts;
out.logs = logs.filter(l => !/favicon|page-work\.json/.test(l));
console.log(JSON.stringify(out, null, 1));
await browser.close(); entry?.server.close();
