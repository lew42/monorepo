import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [,, base, root] = process.argv, rel = "/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/";
const file = root + "/public" + rel + "session.jsonl";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
await p.route("**/ext/JSONL/live.js*", async r => { const res = await r.fetch(); const src = process.env.OLD ? fs.readFileSync("C:/Code/lew42/monorepo/public/framework/ext/JSONL/live.js", "utf8") : await res.text(); const body = src.replace("stream.WAIT = 1500;", "stream.WAIT = 1;").replace("const WAIT = 1500;", "const WAIT = 1;"); r.fulfill({ response: res, body }); });
const t0 = Date.now(); let late = 0;
p.on("console", m => { if (/no answer from the dev server/.test(m.text())) late++; });
await p.goto(base + rel, { waitUntil: "networkidle" }); await p.waitForTimeout(4000);
console.log("loaded in", ((Date.now() - t0) / 1000).toFixed(1), "s; fallback fetches:", late);
const txt = () => p.evaluate(() => document.querySelector(".active-page")?.innerText ?? "");
const id = "probe" + (Date.now() % 100000);
fs.appendFileSync(file, JSON.stringify({ tasks: { add: { id, title: "PROBE " + id + " in flight" } }, by: "probe", ts: new Date().toISOString() }) + "\n");
fs.appendFileSync(file, JSON.stringify({ tasks: { [id]: { start: {} } }, by: "probe", ts: new Date().toISOString() }) + "\n");
let seen = -1; for (let i = 0; i < 15; i++){ await p.waitForTimeout(1000); if ((await txt()).includes("PROBE " + id)) { seen = i + 1; break; } }
console.log("new running task on the page:", seen > 0 ? "after " + seen + " s, no reload" : "NOT seen in 15 s");
fs.appendFileSync(file, JSON.stringify({ tasks: { [id]: { complete: { outcome: "o", evidence: "e" } } }, by: "probe", ts: new Date().toISOString() }) + "\n");
seen = -1; for (let i = 0; i < 15; i++){ await p.waitForTimeout(1000); const inflight = await p.evaluate(() => document.querySelector(".active-page .in-flight")?.innerText ?? ""); if (!inflight.includes("PROBE " + id)) { seen = i + 1; break; } }
console.log("it leaves In flight when completed:", seen > 0 ? "after " + seen + " s" : "NOT in 15 s");
await p.screenshot({ path: "sessfix.png" });
await b.close();
