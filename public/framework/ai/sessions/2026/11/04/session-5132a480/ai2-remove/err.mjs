import { browser } from "../../../../../../../../../Server/Browser.mjs";
const b = await browser(); const p = await b.newPage();
p.on("response", r => r.status() >= 400 && /\.js/.test(r.url()) && console.log(r.status(), r.url()));
p.on("pageerror", e => console.log("pageerror", e.message.slice(0,200)));
await p.goto(process.argv[2] + process.argv[3], { waitUntil: "load" }); await p.waitForTimeout(3000);
console.log(new URL(p.url()).pathname, "|", (await p.evaluate(() => document.body.innerText)).slice(0, 200).replace(/\n/g, " "));
await b.close();
