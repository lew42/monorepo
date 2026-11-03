import { browser } from "../../../../../Server/Browser.mjs";
const B = "http://127.0.0.1:55363";
import fs from "node:fs";
const FILE="C:/Code/lew42/worktrees/jsonl-unsubscribe/public/framework/ai/index.jsonl";
let got=0;
const b = await browser(); const pg = await b.newPage();
const live = new Map(); // path -> net subscribes
let subs = 0, unsubs = 0;
pg.on("websocket", ws => {
  ws.on("framereceived", f => { if (String(f.payload).includes("ai/index.jsonl") && String(f.payload).includes("PROBE")) got++; });
  ws.on("framesent", f => { try { const m = JSON.parse(f.payload); if (m.method==="subscribe"){ subs++; live.set(m.args[0],(live.get(m.args[0])||0)+1);} if (m.method==="unsubscribe"){ unsubs++; live.delete(m.args[0]);} } catch{} });
});
const snap = l => { console.log(l.padEnd(28), "sub", subs, "unsub", unsubs, "open", live.size); console.log("   ", [...live.keys()].map(k=>k.slice(-50)).join(" | ")); };
await pg.goto(B + "/framework/ai/"); await pg.waitForTimeout(4000); snap("on /framework/ai/");
const nav = async u => { await pg.evaluate(u => { const a=document.createElement("a"); a.href=u; document.body.append(a); a.click(); a.remove(); }, u); await pg.waitForTimeout(3000); };
await nav("/framework/core/"); snap("-> /framework/core/");
await nav("/framework/ext/JSONL/"); snap("-> /framework/ext/JSONL/");
const before = subs;
await nav("/framework/ai/"); snap("<- back /framework/ai/");
console.log("re-subscribed on return:", subs > before);
fs.appendFileSync(FILE, JSON.stringify({probe:"PROBE back"})+String.fromCharCode(10)); await pg.waitForTimeout(1500);
console.log("line arrived after return:", got>0);
await nav("/framework/core/"); got=0; fs.appendFileSync(FILE, JSON.stringify({probe:"PROBE away"})+String.fromCharCode(10)); await pg.waitForTimeout(1500);
console.log("line arrives while away (should be false):", got>0);
await b.close();
