import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const [base, out, w = "390"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: 800 } });
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
await p.goto(base + "/framework/ai/sessions/?view=rail", { waitUntil: "load", timeout: 90000 });
await p.waitForSelector(".sessions-card", { timeout: 60000 }); await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const cards = [...document.querySelectorAll(".sessions-card")];
  return { n: cards.length, on_screen: cards.filter(c => c.getBoundingClientRect().bottom <= innerHeight).length,
    kids_lines: cards.filter(c => /child session/.test(c.textContent)).length,
    sample: cards.slice(0, 4).map(c => c.innerText.replace(/\n/g, " | ")) };
});
await p.screenshot({ path: out + `/cards-${w}.png` });
console.log(JSON.stringify({ ...r, errs: errs.slice(0, 5) }, null, 1));
await b.close();
