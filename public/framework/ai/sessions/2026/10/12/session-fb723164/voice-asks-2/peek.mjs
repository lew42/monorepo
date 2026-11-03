import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser(); const page = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
await page.goto(process.argv[2], { waitUntil: "load" }); await page.waitForTimeout(3000);
console.log(await page.evaluate(() => [...document.querySelectorAll("[class*=chatbox], .ux-dictate-btn, textarea")].slice(0, 15).map(e => e.tagName + "." + e.className)));
await page.screenshot({ path: process.argv[3] }); await close();
