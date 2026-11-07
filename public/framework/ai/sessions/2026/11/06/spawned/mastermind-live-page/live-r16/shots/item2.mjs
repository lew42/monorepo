import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [,, base] = process.argv, it = "C:/Code/lew42/monorepo/public/live/zzitem/thing.jsonl";
const A = o => fs.appendFileSync(it, JSON.stringify({ ts: new Date().toISOString(), by: "probe", ...o }) + "\n");
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
const errs = []; p.on("pageerror", e => errs.push(String(e).slice(0, 300)));
const txt = () => p.evaluate(() => document.querySelector(".active-page .live-scroll")?.innerText.replace(/\s+/g, " ").slice(0, 400));
for (const url of ["/live/zzitem/", "/live/zzitem/thing/", "/live/item-test/", "/live/item-test/thing/"]) {
  await p.goto(base + url, { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
  console.log(url, "=>", await txt());
  if (!url.includes("zz")) continue;
  const n = Date.now() % 1000;
  A({ text: "TEXT" + n }); A({ content: { add: { type: "part-text", text: "ADD" + n } } }); await p.waitForTimeout(2500);
  const t = await txt(); console.log("   text live:", t.includes("TEXT" + n), " add live:", t.includes("ADD" + n));
}
console.log("errors:", errs.join("\n") || "none"); await b.close();
