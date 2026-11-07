import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const [,, url] = process.argv;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
const t0 = Date.now();
p.on("console", m => { if (/JSONL|no answer|fetching/i.test(m.text())) console.log(((Date.now() - t0) / 1000).toFixed(1) + "s", m.type(), m.text().slice(0, 200)); });
await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(5000); await b.close();
