import { browser, close } from "../../../../../../Server/browser.mjs";
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e.message || e)));
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));

const row = page.locator(".ai2-row:not(.ai2-row-ask):not(.ai2-row-live):not(.ai2-row-pinned)").first();
const href = await row.getAttribute("href");
const countBefore = await page.locator(".ai2-row:not(.ai2-row-ask):not(.ai2-row-live):not(.ai2-row-pinned)").count();
console.log("row to archive (href):", href, "| rows before:", countBefore);

await row.locator(".ai2-clear").click();
await new Promise(r => setTimeout(r, 400));
const stillThereAfterClick = await page.locator(`a.ai2-row[href="${href}"]`).count();
const countAfterClick = await page.locator(".ai2-row:not(.ai2-row-ask):not(.ai2-row-live):not(.ai2-row-pinned)").count();
console.log("present right after click (0=gone):", stillThereAfterClick, "| rows now:", countAfterClick);

// The "archived" toggle should reveal it again, greyed.
await page.locator(".ai2-archived-word").click();
await new Promise(r => setTimeout(r, 300));
const inArchivedView = await page.locator(`a.ai2-row[href="${href}"]`).count();
console.log("found via the 'archived' toggle:", inArchivedView);
await page.locator(".ai2-archived-word").click();   // toggle back off

await new Promise(r => setTimeout(r, 1500));
await page.reload({ waitUntil: "load" }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));
const stillGoneAfterReload = await page.locator(`a.ai2-row[href="${href}"]`).count();
console.log("present after reload (0 = stayed archived):", stillGoneAfterReload);
console.log("errors:", errs.slice(0, 6));
await close();
