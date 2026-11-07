import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const base = process.argv[2], b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 800 } });
const errs = []; p.on("response", r => r.status() >= 400 && errs.push(r.status() + " " + r.url())); p.on("pageerror", e => errs.push(e.message));
for (const path of ["/live/div-test/", "/live/", "/live/lab/is-page/", "/framework/core/Page/"]){
  await p.goto(base + path, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  const hit = await p.evaluate(() => [...document.querySelectorAll("div")].filter(d => d.textContent.trim() === "Hello world" && !d.querySelector("div")).map(d => d.outerHTML.slice(0, 120)));
  console.log(path, "hello-divs:", JSON.stringify(hit), "cards:", await p.locator("[class*=card]").count());
  if (path === "/live/div-test/") await p.screenshot({ path: process.env.LOCALAPPDATA + "/Temp/pd-div-" + process.argv[3] + ".png" });
}
console.log("errors:", errs.length, errs.slice(0, 5));
await b.close();
