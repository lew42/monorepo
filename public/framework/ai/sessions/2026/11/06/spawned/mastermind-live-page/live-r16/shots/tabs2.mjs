import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [,, base, R = "C:/Code/lew42/monorepo"] = process.argv, root = R + "/public/live/zztabs/";
const W = (f, lines) => { fs.mkdirSync(f.replace(/[^/]+$/, ""), { recursive: true }); fs.writeFileSync(f, lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
const A = (f, o) => fs.appendFileSync(f, JSON.stringify({ ts: new Date().toISOString(), by: "probe", ...o }) + "\n");
W(root + "page.jsonl", [{ title: "Tabs probe", class: "/framework/core/Page/Page.class.js" }, { navigation: "tabs" }, { content: { add: { id: "lk", type: "part-link", path: "./beta/" } } }]);
W(root + "alpha/page.jsonl", [{ title: "Alpha", class: "/live/LivePage.js" }, { tab: true }]);
W(root + "beta/page.jsonl", [{ title: "Beta", class: "/live/LivePage.js" }, { tab: true }]);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
const errs = []; p.on("pageerror", e => errs.push(String(e).slice(0, 300)));
const tabs = () => p.evaluate(() => [...document.querySelectorAll(".active-page .tab-bar a.tab")].map(a => a.textContent.trim()).join(" | ") + "  || cards: " + [...document.querySelectorAll(".active-page .live-pages .live-card-title")].map(h => h.textContent.trim()).join(",") + "  || h1/link: " + [...document.querySelectorAll(".active-page .live-main .live-card-title")].map(h => h.textContent.trim()).join(","));
for (const url of ["/live/zztabs/", "/live/zztabs/alpha/"]) {
  await p.goto(base + url, { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
  console.log(url, "start:", await tabs());
  A(root + "page.jsonl", { tab: { name: "beta", tab: false } }); await p.waitForTimeout(2500); console.log("  parent pick beta off:", await tabs());
  A(root + "page.jsonl", { tab: { name: "beta", tab: true } }); await p.waitForTimeout(2500); console.log("  parent pick beta on:", await tabs());
  A(root + "beta/page.jsonl", { title: "Beta Renamed" }); await p.waitForTimeout(2500); console.log("  beta's own title:", await tabs());
  A(root + "beta/page.jsonl", { title: "Beta" });
  W(root + "gamma/page.jsonl", [{ title: "Gamma", class: "/live/LivePage.js" }, { tab: true }]); A(root + "page.jsonl", { file: "gamma/page.jsonl" }); await p.waitForTimeout(2500); console.log("  new folder + file line:", await tabs());
  A(root + "gamma/page.jsonl", { tab: false }); await p.waitForTimeout(2500); console.log("  gamma's own tab:false:", await tabs());
  fs.rmSync(root + "gamma/page.jsonl"); fs.rmdirSync(root + "gamma");
}
console.log("errors:", errs.join("\n") || "none");
await b.close();
