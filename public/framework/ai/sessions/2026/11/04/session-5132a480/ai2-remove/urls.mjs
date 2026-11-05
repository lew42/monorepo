import { browser } from "../../../../../../../../../Server/Browser.mjs";
const b = await browser();
for (const u of process.argv.slice(3)) { const p = await b.newPage(); await p.goto(process.argv[2] + u, { waitUntil: "load" }); await p.waitForTimeout(2500); console.log(u, "->", new URL(p.url()).pathname, "|", await p.title(), "|", (await p.evaluate(() => document.body.innerText)).slice(0, 60).replace(/\n/g, " ")); await p.close(); }
await b.close();
