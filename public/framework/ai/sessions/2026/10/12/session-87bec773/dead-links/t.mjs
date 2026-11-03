import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
const pg = await (await (await browser()).newContext()).newPage();
const r = await pg.goto("http://monorepo.localhost/framework/zzz/",{waitUntil:"load"}); await pg.waitForTimeout(800);
console.log(r.status(), (await pg.evaluate(()=>document.querySelector(".page.active-page")?.outerHTML?.slice(0,400))), await pg.title());
await close();
