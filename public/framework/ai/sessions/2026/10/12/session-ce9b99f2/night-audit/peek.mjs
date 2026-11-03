import {browser} from "../../../../../../../../../Server/browser.mjs";
const b = await browser(); const ctx = await b.newContext({viewport:{width:1200,height:900}});
for (const u of process.argv.slice(2)) { const p = await ctx.newPage(); await p.goto("http://monorepo.localhost"+u,{waitUntil:"load"}); await p.waitForTimeout(2500); console.log(u, "=>", JSON.stringify((await p.evaluate(()=>document.body.innerText)).slice(0,160))); await p.close(); }
process.exit(0);
