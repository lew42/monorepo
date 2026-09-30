import { browser, close } from "../../../../../../Server/browser.mjs";
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 3000));
const href = process.argv[3];
const el = page.locator(`a.ai2-row[href="${href}"]`);
const n = await el.count();
console.log("count:", n);
if (n){
	console.log("class:", await el.first().getAttribute("class"));
	console.log("classList visible?", await el.first().isVisible());
}
await close();
