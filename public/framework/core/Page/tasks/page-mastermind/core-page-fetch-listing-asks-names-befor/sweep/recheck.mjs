// node recheck.mjs <base> <in.json> <out.json> — reloads only the rows that timed out, one at a time, and times each load
import { browser as launch, close } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs";
const [base, inp, out] = process.argv.slice(2);
const urls = JSON.parse(fs.readFileSync(inp, "utf8")).rows.filter(r => (r.errs || []).some(e => /^goto:/.test(e))).map(r => r.url);
const b = await launch({ headless: true }); const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
const rows = [];
for (const u of urls) {
  const errs = [], page = await ctx.newPage(); let xhr = 0;
  page.on("pageerror", e => errs.push("pageerror: " + e.message.slice(0, 200)));
  page.on("request", r => { if (r.url().includes("/api/folder-names")) xhr++; });
  page.on("response", r => { const x = r.url(); if (r.status() >= 400 && x.startsWith(base) && !x.endsWith("/favicon.ico")) errs.push(r.status() + " " + x.slice(base.length)); });
  const t0 = Date.now();
  try { await page.goto(base + u, { waitUntil: "load", timeout: 45000 }); } catch (e) { errs.push("goto: " + e.message.slice(0, 80)); }
  const ms = Date.now() - t0; await page.close(); rows.push({ url: u, ms, folder_names_calls: xhr, errs }); console.log(ms, xhr, errs.length, u);
}
await close?.();
fs.writeFileSync(out, JSON.stringify({ base, rows }, null, 1)); process.exit(0);
