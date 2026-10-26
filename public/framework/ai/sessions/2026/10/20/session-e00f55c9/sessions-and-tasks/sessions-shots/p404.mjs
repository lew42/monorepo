import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
const S="/framework/ai/sessions/2026/10/20/session-e00f55c9/";
const b=await Browser.browser();
for(const p of [S, S+"sessions-and-tasks/deputy/roles/","/framework/ai/sessions/2026/10/"]){
 const pg=await b.newPage({viewport:{width:1920,height:1000}});const u=new Set();
 pg.on("response",r=>{if(r.status()>=400)u.add(r.status()+" "+r.url().replace("http://monorepo.localhost","").replace(/session-e00f55c9\/sessions-and-tasks\/[^/]+/,"…"))});
 await pg.goto("http://monorepo.localhost"+p,{waitUntil:"load"});await pg.waitForTimeout(4000);
 console.log(p,u.size);console.log([...u].slice(0,12).join("\n"));
 const h=await pg.evaluate(()=>[document.title,location.pathname,[...document.querySelectorAll("h1,h2")].slice(0,4).map(e=>e.innerText)]);console.log(JSON.stringify(h));
 await pg.close();}
await Browser.close();
