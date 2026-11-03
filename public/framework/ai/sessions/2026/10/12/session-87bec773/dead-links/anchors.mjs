import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
import fs from "node:fs";
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").map(JSON.parse).filter(r => r.status === 404);
const pg = await (await (await browser()).newContext()).newPage();
const bySrc = Map.groupBy(rows, r => r.from);
for (const [src, rs] of bySrc) {
  await pg.goto("http://monorepo.localhost" + src, { waitUntil: "load" }); await pg.waitForTimeout(500);
  const targets = rs.map(r => r.url);
  const res = await pg.evaluate(t => [...document.querySelectorAll("a[href]")].filter(a => t.includes(new URL(a.href).pathname)).map(a => `${a.getAttribute("href")} | ${a.textContent.trim().slice(0,40)} | in ${a.closest("[class]")?.className.slice(0,30)}`), targets);
  console.log("##", src); res.slice(0,4).forEach(x => console.log("  ", x));
}
await close();
