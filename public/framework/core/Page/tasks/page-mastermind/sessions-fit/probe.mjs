import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const b=await Browser.browser();const ctx=await b.newContext({viewport:{width:1920,height:1000}});const pg=await ctx.newPage();
await pg.goto("http://127.0.0.1:56227/framework/ai/sessions/",{waitUntil:"load"});await pg.waitForTimeout(6000);
console.log(JSON.stringify(await pg.evaluate(()=>{const p=document.querySelector(".sessions-page"),f=document.querySelector(".sessions-frame");const cs=getComputedStyle(p),fs=getComputedStyle(f);return {rows:cs.gridTemplateRows,cs:cs.gridAutoRows,h:fs.height,gr:fs.gridRow,as:fs.alignSelf,mh:fs.minHeight,kids:[...p.children].map(c=>c.className.slice(0,30)+":"+Math.round(c.getBoundingClientRect().height))}})));
await Browser.close();
