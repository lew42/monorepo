import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs";
const r=JSON.parse(fs.readFileSync("shots/after/results.json"));
const b=await Browser.browser();const out=[];
for(const p of [...new Set(r.map(x=>x.p))]){
 const ctx=await b.newContext({viewport:{width:400,height:900}});const pg=await ctx.newPage();
 await pg.goto("http://127.0.0.1:56227"+p,{waitUntil:"load"});await pg.waitForTimeout(4000);
 out.push({p,...await pg.evaluate(()=>{const bar=document.querySelector(".inbox-head .tab-bar");const t=[...(bar?.children||[])].map(e=>e.getBoundingClientRect());
  return {tabs:t.length,allIn:t.length>0&&t.every(x=>x.left>=0&&x.right<=innerWidth),bar:bar?bar.scrollWidth<=bar.clientWidth+1:null,pageSW:document.documentElement.scrollWidth}})});
 await ctx.close();}
console.log(JSON.stringify(out,null,0).replace(/\},/g,"},\n"));await Browser.close();
