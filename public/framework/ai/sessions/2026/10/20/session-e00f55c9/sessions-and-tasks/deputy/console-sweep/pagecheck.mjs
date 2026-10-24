// node pagecheck.mjs <base> <out.json>  — loads every record folder under session-e00f55c9 and counts console trouble
import { browser as launch, close } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs"; import path from "node:path";
const [base, out] = process.argv.slice(2);
const root = "C:/Code/lew42/monorepo/public";
const start = root + "/framework/ai/sessions/2026/10/20/session-e00f55c9";
const dirs = [];
(function walk(d){ const names = fs.readdirSync(d, { withFileTypes: true });
  if (names.some(n => n.isFile() && /^(task|session)\.jsonl$/.test(n.name))) dirs.push(d);
  for (const n of names) if (n.isDirectory() && !/^(shots|review|node_modules)$/.test(n.name)) walk(path.join(d, n.name)); })(start);
const urls = dirs.map(d => d.split(path.sep).join("/").slice(root.length) + "/");
const b = await launch({ headless: true }); const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
const rows = [];
for (const u of urls) {
  const errs = [], page = await ctx.newPage();
  page.on("console", m => { const t = m.text(); if (m.type() === "error" && !/Failed to load resource/.test(t)) errs.push("console: " + t.slice(0, 200)); if (m.type() === "warning" && /can't start|cannot start/.test(t)) errs.push("warn: " + t.slice(0, 200)); });
  page.on("pageerror", e => errs.push("pageerror: " + e.message.slice(0, 200)));
  page.on("response", r => { const x = r.url(); if (r.status() >= 400 && x.startsWith(base) && !x.endsWith("/favicon.ico")) errs.push(r.status() + " " + r.request().method() + " " + x.slice(base.length)); });
  try { await page.goto(base + u, { waitUntil: "load", timeout: 20000 }); await page.waitForTimeout(2000); } catch (e) { errs.push("goto: " + e.message.slice(0, 120)); }
  await page.close(); rows.push({ url: u, n: errs.length, errs });
}
await close?.();
const bad = rows.filter(r => r.n);
fs.writeFileSync(out, JSON.stringify({ base, at: new Date().toISOString(), pages: rows.length, bad_pages: bad.length, errors: rows.reduce((a, r) => a + r.n, 0), rows }, null, 1));
console.log(`${base}: ${rows.length} pages, ${bad.length} with trouble, ${rows.reduce((a, r) => a + r.n, 0)} lines`);
process.exit(0);
