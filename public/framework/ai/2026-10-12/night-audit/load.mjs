// Headless load of every page a landing cites, at 1200 and 400: errors + horizontal overflow.
import {browser as sharedBrowser} from "../../../../../Server/browser.mjs"; import fs from "fs";
const claims = JSON.parse(fs.readFileSync(new URL("./claims.json", import.meta.url)));
const urls = new Set();
for (const c of claims.filter(c=>c.landed)) for (const m of c.outcome.matchAll(/\]\((\/framework\/[^)#\s]+?\/?)\)|`(\/framework\/[\w\/\-]+\/)`/g)) { const u=m[1]||m[2]; if(!/\.\w+$/.test(u)||/\.md$/.test(u)&&0) if(!/\.\w{1,4}$/.test(u)) urls.add(u); }
urls.add("/framework/ai2/live/");
const b = await sharedBrowser(); const out = [];
for (const w of [1200, 400]) {
  const ctx = await b.newContext({viewport:{width:w,height:900}});
  for (const u of urls) {
    const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", e => errs.push(String(e).slice(0,100)));
    let status = 0;
    try { const r = await p.goto("http://monorepo.localhost"+u, {waitUntil:"load", timeout:20000}); status = r?.status(); await p.waitForTimeout(1200);
      const o = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, len: document.body.innerText.length, nf: /not found|404/i.test(document.body.innerText.slice(0,300))}));
      out.push({u, w, status, errs: errs.length, over: o.sw > o.cw + 2, len: o.len, nf: o.nf, e: errs[0]});
    } catch (e) { out.push({u, w, status, fail: String(e).slice(0,80)}); }
    await p.close();
  }
}

fs.writeFileSync(new URL("./load.json", import.meta.url), JSON.stringify(out,null,1));
const bad = out.filter(r => r.fail || r.errs || r.over || r.nf || r.len < 80 || r.status >= 400);
console.log(out.length, "loads;", bad.length, "flagged"); bad.forEach(r => console.log(JSON.stringify(r)));
