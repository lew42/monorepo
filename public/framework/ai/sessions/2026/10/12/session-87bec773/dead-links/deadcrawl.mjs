// BFS crawl of /framework/ + /notes/ (skips ai/sessions store); records same-origin 404s with their source page.
import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
import fs from "node:fs";
const base = "http://monorepo.localhost", out = process.argv[2];
const skip = /^\/(framework\/ai\/sessions\/|framework\/ai2\/|alex\/|castin\/|edric\/|michael\/)/;
const queue = ["/framework/", "/notes/"], seen = new Set(queue), from = new Map();
const b = await browser(); const ctx = await b.newContext(); let pg = await ctx.newPage();
let n = 0, nbad = 0;
async function visit(u) {
  const r = await pg.goto(base + u, { waitUntil: "load", timeout: 15000 });
  let status = r?.status() ?? 0;
  await pg.waitForTimeout(250);
  const hrefs = await pg.$$eval("a[href]", as => as.map(a => a.getAttribute("href")));
  if (await pg.evaluate(() => /nothing matches/.test(document.querySelector(".page.active-page .error")?.textContent || ""))) status = 404;
  for (const h of hrefs) {
    if (!h || /^(#|mailto|tel|javascript)/i.test(h)) continue;
    let x; try { x = new URL(h, base + u) } catch { continue }
    if (x.origin !== base) continue;
    const p = x.pathname;
    if (!/^\/(framework|notes)\//.test(p) || skip.test(p)) continue;
    if (/\.(png|jpe?g|gif|webp|svg|ico|pdf|zip|json|jsonl|mp\d|wav|woff2?|css|map)$/i.test(p)) continue;
    if (!from.has(p)) from.set(p, u);
    if (!seen.has(p)) { seen.add(p); queue.push(p); }
  }
  return status;
}
while (queue.length) {
  const u = queue.shift(); n++;
  let status;
  try { status = await Promise.race([visit(u), new Promise((_, j) => setTimeout(() => j(new Error("hang")), 25000))]); }
  catch (e) { status = e.message === "hang" ? -2 : -1; if (status === -2) { try { await pg.close() } catch {} pg = await ctx.newPage(); } }
  if (status >= 400 || status < 0) { nbad++; fs.appendFileSync(out, JSON.stringify({ url: u, status, from: from.get(u) }) + "\n"); }
  fs.writeFileSync(out + ".prog", `${n} queue=${queue.length} bad=${nbad} last=${u}`);
}
console.log("pages", n, "bad", nbad);
await close();
