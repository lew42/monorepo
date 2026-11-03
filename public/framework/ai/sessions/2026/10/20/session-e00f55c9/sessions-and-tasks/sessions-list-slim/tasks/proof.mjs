import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "fs";
const WT="C:/Code/lew42/worktrees/session-tasks-grid", D=import.meta.dirname;
const files=["SessionTasksGrid.js","SessionTasksGrid.css","SessionWork.js","AISessionDetail.js"];
const mode=process.argv[2]; // before|after
const b=await chromium.launch(); const out={};
for(const w of mode==="before"?[390]:[390,1920]){
 const ctx=await b.newContext({viewport:{width:w,height:900}}); const pg=await ctx.newPage(); const errs=[];
 pg.on("pageerror",e=>errs.push(String(e)));
 if(mode==="after") for(const f of files) await pg.route(`**/framework/ai/AISession/${f}*`,r=>r.fulfill({body:fs.readFileSync(`${WT}/public/framework/ai/AISession/${f}`),contentType:f.endsWith("css")?"text/css":"text/javascript"}));
 await pg.goto("http://monorepo.localhost/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/?tab=work",{waitUntil:"networkidle"}).catch(()=>{});
 await pg.waitForTimeout(6000); if(mode==="after") await pg.waitForSelector(".stg .datagrid-row",{timeout:60000}).catch(()=>{});
 await pg.screenshot({path:`${D}/${mode}-${w}.png`,timeout:90000});
 const m={errs,sw:await pg.evaluate(()=>document.documentElement.scrollWidth)};
 if(mode==="after"){
  m.nestedNodes=await pg.evaluate(()=>{const e=document.querySelector(".sw-list");return e?e.querySelectorAll(".sw-node").length:-1});
  m.stg=await pg.evaluate(()=>{const e=document.querySelector(".stg");return e?{total:e.dataset.total,rows:e.dataset.rows,days:0}:null});
  if(w===1920){
   // per-day counts by toggling
   const days=await pg.evaluate(()=>{const x=document.querySelector(".stg");return null});
   await pg.click(".stg-head .sessions-hbtn"); await pg.waitForTimeout(500);
   const info=await pg.evaluate(()=>[...document.querySelectorAll(".stl-menu")].map(l=>l.textContent));
   m.menu=info;
   // switch all but the first day off
   const dayBoxes=await pg.evaluate(()=>{const ls=[...[...document.querySelectorAll(".stl-menu")].find(m=>/State/.test(m.textContent)).querySelectorAll(".stl-filter")];return ls.map((l,i)=>[i,l.textContent,/^\d{4}-\d\d-\d\d|^no date/.test(l.textContent)])});
   m.dayBoxes=dayBoxes.filter(x=>x[2]);
   const counts=[];
   for(const [i] of m.dayBoxes){ // show only day i
     await pg.evaluate(([keep,all])=>{all.forEach(j=>{const b=[...document.querySelectorAll(".stl-menu")].find(m=>/State/.test(m.textContent)).querySelectorAll(".stl-filter input")[j]; if(b.checked!==(j===keep)) b.click();});},[i,m.dayBoxes.map(x=>x[0])]);
     await pg.waitForTimeout(300); counts.push(await pg.evaluate(()=>+document.querySelector(".stg").dataset.rows));
     if(i===m.dayBoxes[0][0]) await pg.screenshot({path:`${D}/after-day.png`,timeout:90000});
   }
   m.dayCounts=counts; m.sum=counts.reduce((a,c)=>a+c,0);
  }
  await pg.keyboard.press("Escape");
 }
 out[w]=m; await ctx.close();
}
console.log(JSON.stringify(out,null,1)); await b.close();
