import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const b=await Browser.browser();
const ctx=await b.newContext({viewport:{width:3440,height:1000}});const pg=await ctx.newPage();
await pg.goto("http://127.0.0.1:56227/framework/ai/sessions/",{waitUntil:"load"});await pg.waitForTimeout(6000);
console.log(JSON.stringify(await pg.evaluate(()=>{
 const o=[...document.querySelectorAll(".sessions-cell")].filter(c=>c.scrollWidth>c.clientWidth+1).map(c=>({i:[...c.parentElement.children].indexOf(c)+1,sw:c.scrollWidth,cw:c.clientWidth,t:c.innerText.slice(0,30)}));
 let ov=0;for(const c of document.querySelectorAll(".sessions-cell:nth-child(6)")){const k=[...c.querySelectorAll("*")].map(e=>e.getBoundingClientRect()).filter(r=>r.width);for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++){const a=k[i],d=k[j];if(a.left<d.right-1&&d.left<a.right-1&&a.top<d.bottom-1&&d.top<a.bottom-1&&!(a.left<=d.left&&a.right>=d.right&&a.top<=d.top&&a.bottom>=d.bottom)&&!(d.left<=a.left&&d.right>=a.right&&d.top<=a.top&&d.bottom>=a.bottom))ov++}}
 return {o,ov}})));await ctx.close();await Browser.close();
