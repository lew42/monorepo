// shot.mjs — screenshot /framework/ai2/ at a given width, after settling a moment.
// Usage: node shot.mjs <url> <width> <out.png>
import { browser, close } from "../../../../../../Server/browser.mjs";

const [url, widthArg, out] = process.argv.slice(2);
const width = Number(widthArg) || 1920;
if (!url || !out) { console.error("usage: node shot.mjs <url> <width> <out.png>"); process.exit(1); }

const b = await browser();
const page = await (await b.newContext({ viewport: { width, height: 1080 } })).newPage();
await page.goto(url, { waitUntil: "load", timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 3000));   // let streams settle and the Live view finish its first paint
await page.screenshot({ path: out });
console.log("wrote", out);
await close();
