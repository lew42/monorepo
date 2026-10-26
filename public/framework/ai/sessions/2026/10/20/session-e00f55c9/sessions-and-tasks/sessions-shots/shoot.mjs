import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import fs from "node:fs";
const S="/framework/ai/sessions/2026/10/20/session-e00f55c9/";
const pages=[S+"sessions-and-tasks/"];const _x=[
"/framework/ai/sessions/","/framework/ai/sessions/2026/","/framework/ai/sessions/2026/10/","/framework/ai/sessions/2026/10/20/",S,
S+"sessions-and-tasks/",S+"sessions-and-tasks/deputy/",S+"sessions-and-tasks/process-system/",S+"sessions-and-tasks/deputy/roles/",S+"sessions-and-tasks/deputy/review-page/",
S+"sessions-and-tasks/session-record/",
"/framework/ai/sessions/2026/10/20/session-00324b25/","/framework/ai/sessions/2026/10/20/voice-20261020/","/framework/ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/"];
const widths=[1920,3440], out=[];
const b=await Browser.browser();
for(const p of pages) for(const w of widths){
  const ctx=await b.newContext({viewport:{width:w,height:1000}}); const pg=await ctx.newPage();
  const errs=[],f404=[];
  pg.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
  pg.on("pageerror",e=>errs.push("pageerror: "+e.message));
  pg.on("response",r=>{if(r.status()>=400)f404.push(r.status()+" "+r.url().replace("http://monorepo.localhost",""))});
  pg.on("requestfailed",r=>f404.push("FAILED "+r.url().replace("http://monorepo.localhost","")));
  let nav="ok";
  try{await pg.goto("http://monorepo.localhost"+p,{waitUntil:"load",timeout:30000});}catch(e){nav=e.message.slice(0,80)}
  await pg.waitForTimeout(2500);
  const m=await pg.evaluate(()=>{const de=document.documentElement;
    const body=document.body.innerText||"";
    const cut=[];const sb=document.querySelector("nav,.sidebar,aside");
    const sbr=sb?sb.getBoundingClientRect():null;
    for(const e of document.querySelectorAll("h1,h2,p,a,td,th,li,span")){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
      if(r.right>innerWidth+1||r.left<-1)cut.push((e.tagName+":"+(e.innerText||"").slice(0,30)).replace(/\s+/g," "));
      if(cut.length>4)break;}
    return {sw:de.scrollWidth,cw:de.clientWidth,sh:de.scrollHeight,textLen:body.length,title:document.title,first:body.slice(0,90).replace(/\s+/g," "),cut,
      sb:sbr?[Math.round(sbr.left),Math.round(sbr.width)]:null}});
  const slug=p.replace(/^\/framework\/ai\/sessions\/?/,"").replace(/\/$/,"").replace(/\//g,"_")||"root";
  const file=`shots/${slug}-${w}.png`;
  await pg.screenshot({path:file,fullPage:false});
  out.push({p,w,file,nav,errs:errs.length,err1:errs[0]?.slice(0,160),f404:f404.length,f1:f404[0],...m});
  await ctx.close();
}
fs.writeFileSync("results2.json",JSON.stringify(out,null,1));
await Browser.close();
