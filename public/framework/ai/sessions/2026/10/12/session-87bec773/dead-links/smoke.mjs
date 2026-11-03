import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
const b = await browser(), pg = await (await b.newContext()).newPage();
for (const u of ["/framework/design/","/framework/code/","/framework/audio/","/framework/ai/doc/","/framework/core/Page/md/","/framework/ux/doc/","/framework/styles/doc/theme/","/framework/styles/doc/theme.md","/framework/styles/doc/cascade/","/framework/ux/doc/system/","/framework/dev/Socket/doc/Socket-notes/"]) {
  await pg.goto("http://monorepo.localhost"+u,{waitUntil:"load"}); await pg.waitForTimeout(1200);
  const e = await pg.evaluate(()=>document.querySelector(".page.active-page .error")?.textContent?.slice(0,80)||"");
  const hs = await pg.evaluate(()=>[...document.querySelectorAll(".page.active-page a[href]")].length);
  console.log(u, e?("ERR "+e):"ok", hs);
}
await close();
