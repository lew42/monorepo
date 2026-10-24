import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const b=await Browser.browser();
const ctx=await b.newContext({viewport:{width:1920,height:1000}});const pg=await ctx.newPage();
await pg.goto("http://127.0.0.1:56227/framework/ai/sessions/",{waitUntil:"load"});await pg.waitForTimeout(6000);
await pg.evaluate(()=>{for(const e of document.querySelectorAll("*"))if(e.scrollHeight>e.clientHeight+50&&/auto|scroll/.test(getComputedStyle(e).overflowY))e.scrollTop=1e6;scrollTo(0,1e6)});
await pg.waitForTimeout(800);await pg.screenshot({path:"shots/fix-1920-bottom.png"});await ctx.close();await Browser.close();
