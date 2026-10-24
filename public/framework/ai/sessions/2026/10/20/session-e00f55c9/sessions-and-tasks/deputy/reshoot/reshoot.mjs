/* Re-shoot the sessions-pages report (../../sessions-shots/report.md) after causes A and E landed: the same 14 pages
   at 400, 1200, 1920 and 3440 on the main site, headless. Counts console errors and failed requests per row the same
   way sessions-shots/shoot.mjs did, writes shots/<slug>-<width>.png, results.json, and compare.md (before vs after). */
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), before_dir = path.join(here, "../../sessions-shots");
const S = "/framework/ai/sessions/2026/10/20/session-e00f55c9/";
const pages = ["/framework/ai/sessions/", "/framework/ai/sessions/2026/", "/framework/ai/sessions/2026/10/", "/framework/ai/sessions/2026/10/20/", S,
	S + "sessions-and-tasks/", S + "sessions-and-tasks/deputy/", S + "sessions-and-tasks/process-system/", S + "sessions-and-tasks/deputy/roles/", S + "sessions-and-tasks/deputy/review-page/",
	S + "sessions-and-tasks/session-record/",
	"/framework/ai/sessions/2026/10/20/session-00324b25/", "/framework/ai/sessions/2026/10/20/voice-20261020/", "/framework/ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/"];
const widths = [400, 1200, 1920, 3440], out = [];
const b = await Browser.browser();
for (const p of pages) for (const w of widths){
	const ctx = await b.newContext({ viewport: { width: w, height: 1000 } }), pg = await ctx.newPage();
	const errs = [], bad = [];
	pg.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
	pg.on("pageerror", e => errs.push("pageerror: " + e.message));
	pg.on("response", r => { if (r.status() >= 400) bad.push(r.status() + " " + r.url().replace("http://monorepo.localhost", "")); });
	pg.on("requestfailed", r => { const u = r.url(); if (!/\/(socket|live|stream)/.test(u)) bad.push("FAILED " + u.replace("http://monorepo.localhost", "")); });
	let nav = "ok";
	try { await pg.goto("http://monorepo.localhost" + p, { waitUntil: "load", timeout: 30000 }); } catch (e) { nav = e.message.slice(0, 80); }
	await pg.waitForTimeout(2500);
	const slug = p.replace(/^\/framework\/ai\/sessions\/?/, "").replace(/\/$/, "").replace(/\//g, "_") || "root";
	const file = `shots/${slug}-${w}.png`;
	try { await pg.screenshot({ path: path.join(here, file), timeout: 20000 }); } catch (e) { nav += " · no shot: " + e.message.slice(0, 40); }   // a page whose live streams keep it busy can time the shot out (sessions-and-tasks/ at 3440)
	out.push({ p, w, file, nav, errs: errs.length, err1: errs[0]?.slice(0, 160), bad: bad.length, bad1: bad[0] });
	await ctx.close();
}
await Browser.close();
fs.writeFileSync(path.join(here, "results.json"), JSON.stringify(out, null, 1));
// before: the first run, with the second run's rows (the two timeouts) laid over it
const before = new Map();
for (const f of ["results.json", "results2.json"]) for (const r of JSON.parse(fs.readFileSync(path.join(before_dir, f), "utf8"))) before.set(r.p + "|" + r.w, r);
const sum = (rows, k) => rows.reduce((n, r) => n + (r[k] || 0), 0);
const bs = out.map(r => before.get(r.p + "|" + r.w)).filter(Boolean);
const lines = [`# Sessions pages, re-shot after causes A and E landed`, ``,
	`Main site, headless, ${new Date().toISOString().slice(0, 16)}. Same 14 pages and 4 widths as [the first report](../../sessions-shots/report.md); made by \`reshoot.mjs\`.`, ``,
	`**Console errors: ${sum(bs, "errs")} before, ${sum(out, "errs")} after. Failed requests: ${sum(bs, "f404")} before, ${sum(out, "bad")} after** (live streams cut at page close are not counted).`, ``,
	`| page (S = ${S}) | width | console errors before → after | failed requests before → after | first error now | shot |`, `|---|---|---|---|---|---|`];
for (const r of out){
	const o = before.get(r.p + "|" + r.w);
	lines.push(`| ${r.p.replace(S, "S/")} | ${r.w} | ${o ? o.errs : "?"} → ${r.errs} | ${o ? o.f404 : "?"} → ${r.bad} | ${(r.err1 || r.bad1 || "").replace(/\|/g, "/").slice(0, 90)} | [shot](${r.file}) |`);
}
fs.writeFileSync(path.join(here, "compare.md"), lines.join("\n") + "\n");
console.log(lines[4]);
