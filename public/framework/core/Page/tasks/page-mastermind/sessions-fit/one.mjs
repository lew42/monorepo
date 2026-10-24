import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const b=await Browser.browser();
for(const w of [1920,3440]){const ctx=await b.newContext({viewport:{width:w,height:1000}});const pg=await ctx.newPage();
await pg.goto("http://127.0.0.1:56227/framework/ai/sessions/",{waitUntil:"load"});await pg.waitForTimeout(6000);
await pg.screenshot({path:`shots/fix-${w}.png`});
console.log(w,JSON.stringify(await pg.evaluate(()=>{const g=document.querySelector(".sessions-page .datagrid");const h=document.querySelector(".datagrid-head");
 const roles=[...document.querySelectorAll(".sessions-cell")].filter(c=>c.scrollWidth>c.clientWidth+1).length;
 return {grid:g?.className,head:!!h&&getComputedStyle(h).display,gw:g?.clientWidth,cellsOverflow:roles,foot:(()=>{const f=[...document.querySelectorAll("*")].find(e=>e.children.length<4&&/sessions listed/.test(e.textContent)&&e.textContent.length<400);return f?[f.className,f.parentElement.className]:null})()}})));await ctx.close()}
await Browser.close();
