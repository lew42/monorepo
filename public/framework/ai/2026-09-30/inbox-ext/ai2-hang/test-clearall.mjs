import { browser, close } from "../../../../../../Server/browser.mjs";
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e.message || e)));
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
page.on("dialog", d => { console.log("confirm():", d.message()); d.accept(); });
await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));

const SEL = ".ai2-rows .ai2-row:not(.ai2-row-ask):not(.ai2-row-live):not(.ai2-row-pinned):not(.ai2-group-row):not(.ai2-page-row)";
const before = await page.locator(SEL).evaluateAll(els => els.map(e => e.getAttribute("href")));
console.log("plain card rows before:", before.length, before);

await page.locator(".ai2-clear-all").click();
await new Promise(r => setTimeout(r, 3000));
const stillThere = [];
for (const href of before) if (await page.locator(`a.ai2-row[href="${href}"]`).count()) stillThere.push(href);
console.log("of those, still present after clear all:", stillThere.length, stillThere);

await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));
const stillThereAfterReload = [];
for (const href of before) if (await page.locator(`a.ai2-row[href="${href}"]`).count()) stillThereAfterReload.push(href);
console.log("of those, still present after a fresh reload:", stillThereAfterReload.length, stillThereAfterReload);
console.log("errors:", errs.slice(0, 8));
await close();
