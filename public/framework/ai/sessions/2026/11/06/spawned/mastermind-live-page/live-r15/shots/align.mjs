import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const b = await chromium.launch();
for (const w of [400, 1200, 1920, 3440]) { const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(process.argv[2], { waitUntil: "networkidle" }); await p.waitForTimeout(2000);
  console.log(w, JSON.stringify(await p.evaluate(() => { const L = s => Math.round(document.querySelector(".active-page " + s)?.getBoundingClientRect().left); return { title: L(".live-title"), card: L(".live-scroll .live-card"), status: L(".live-dot") }; }))); await p.close(); }
await b.close();
