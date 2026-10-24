import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const base = "http://127.0.0.1:53825", out = new URL("./shots/", import.meta.url).pathname.slice(1);
const b = await chromium.launch(), log = [];
for (const day of ["2026-10-24", "2026-10-20"]) for (const w of [1200, 1920]) {
	const p = await b.newPage({ viewport: { width: w, height: 1000 } });
	await p.goto(`${base}/framework/ai/${day}/`); await p.waitForSelector('.aid[data-ready="true"]', { timeout: 30000 }); await p.waitForTimeout(2500);
	await p.screenshot({ path: `${out}${day}-${w}.png` });
	log.push(`${day} ${w}: merge section=${await p.locator(".aid-merge").count()} approve buttons=${await p.locator(".aid-approve").count()} nosnap=${await p.locator(".aid-nosnap").count()}`);
	await p.close();
}
const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
await p.goto(`${base}/framework/ai/2026-10-20/`); await p.waitForSelector('.aid[data-ready="true"]'); await p.waitForTimeout(2500);
const box = p.locator(".aid-session", { has: p.locator(".aid-approve") }).first();
const href = await box.locator(".aid-sname").getAttribute("href");
log.push("approving session " + href);
await box.locator(".aid-approve").click(); await p.waitForTimeout(2500);
log.push("after press: " + await box.locator(".aid-approved").count() + " approved label");
await p.screenshot({ path: `${out}approved-1200.png` });
await p.goto(`${base}${href}`); await p.waitForTimeout(6000);
log.push("session page: approve-all buttons=" + await p.locator(".sw-approve-all").count() + " approved text=" + await p.locator("text=/approved/i").count());
await p.screenshot({ path: `${out}session-page-after.png` });
console.log(log.join("\n")); await b.close();
