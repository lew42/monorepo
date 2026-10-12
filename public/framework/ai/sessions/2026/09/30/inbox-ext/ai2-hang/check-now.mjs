import { browser, close } from "../../../../../../Server/browser.mjs";
const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e.message || e)));
await page.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(e => errs.push("goto " + e.message));
await new Promise(r => setTimeout(r, 1500));
const info = await page.evaluate(() => ({
	title: document.title,
	h1: document.querySelector("h1, .page-title")?.textContent ?? null,
	bodyStart: document.body.innerText.slice(0, 300),
}));
console.log(JSON.stringify(info, null, 2));
console.log("errors:", errs);
await close();
