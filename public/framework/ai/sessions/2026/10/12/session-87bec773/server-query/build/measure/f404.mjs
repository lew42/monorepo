import { browser, close } from "../../../../../../../../../../../Server/browser.mjs";
const b = await browser(), page = await (await b.newContext({ viewport: { width: 1920, height: 900 } })).newPage(), seen = new Map();
page.on("response", r => { if (r.status() === 404) { const u = r.url().replace(/^https?:\/\/[^/]+/, ""); seen.set(u, (seen.get(u) || 0) + 1); } });
await page.goto(process.argv[2] + "/framework/ai/sessions/" + (process.argv[3] || ""), { waitUntil: "commit" });
await page.waitForSelector("a.sessions-row", { timeout: 60000, state: "attached" }); await page.waitForTimeout(3000);
console.log([...seen].slice(0, 8)); console.log(seen.size, "distinct");
await close();
