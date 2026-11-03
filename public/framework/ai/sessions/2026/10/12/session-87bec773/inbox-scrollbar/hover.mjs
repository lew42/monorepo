import { browser, close } from "../../../../../../../../../Server/browser.mjs";
const b = await browser(); const out = process.argv[2];
for (const w of [400,1920,3440]) {
  const pg = await (b.newPage ? b.newPage({ viewport: { width: w, height: 900 } }) : b.newContext({viewport:{width:w,height:900}}).then(c=>c.newPage()));
  await pg.goto("http://monorepo.localhost/framework/ai/", { waitUntil: "networkidle" });
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${out}/after-${w}.png` });
  if (w === 1920) { await pg.hover(".inbox-rows"); await pg.waitForTimeout(300); await pg.screenshot({ path: `${out}/hover-1920.png`, clip:{x:250,y:60,width:420,height:800} }); }
  await pg.close();
}
await close();
