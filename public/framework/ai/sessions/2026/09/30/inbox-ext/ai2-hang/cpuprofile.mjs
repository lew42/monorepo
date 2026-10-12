// cpuprofile.mjs — CPU-profile the first 20s of loading a url, print the top 15
// self-time functions. Usage: node cpuprofile.mjs <url> [out.cpuprofile]
import { browser, close } from "../../../../../../Server/browser.mjs";
import fs from "node:fs";

const url = process.argv[2];
const out = process.argv[3] || null;
if (!url) { console.error("usage: node cpuprofile.mjs <url> [out.cpuprofile]"); process.exit(1); }

const b = await browser();
const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e.message || e)));
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
page.on("requestfailed", r => errs.push("404/failed: " + r.url()));
page.on("response", r => { if (r.status() === 404) errs.push("404: " + r.url()); });

const cdp = await page.context().newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 }); // microseconds

await cdp.send("Profiler.start");
const t0 = Date.now();
await page.goto(url, { waitUntil: "load", timeout: 30000 }).catch(e => errs.push("goto " + e.message));
await new Promise(r => setTimeout(r, 20000));
const { profile } = await cdp.send("Profiler.stop");
const elapsed = Date.now() - t0;

if (out) fs.writeFileSync(out, JSON.stringify(profile));

// Aggregate self time per function (functionName + url + line), across all node ids that share it.
const nodeById = new Map(profile.nodes.map(n => [n.id, n]));
const hits = new Map(); // id -> sample count, from the samples array (more accurate than node.hitCount alone)
for (const id of profile.samples) hits.set(id, (hits.get(id) || 0) + 1);

// timeDeltas[i] is the microseconds between samples[i-1] and samples[i] (the FIRST delta is before
// the first sample). Attribute each delta to the sample it PRECEDES, which is Chrome's own convention.
let selfUs = new Map(); // id -> microseconds
for (let i = 0; i < profile.samples.length; i++){
	const id = profile.samples[i];
	const dt = profile.timeDeltas[i] ?? 0;
	selfUs.set(id, (selfUs.get(id) || 0) + dt);
}

const byFn = new Map(); // key -> { name, url, line, selfMs, calls }
for (const [id, us] of selfUs){
	const n = nodeById.get(id);
	if (!n) continue;
	const cf = n.callFrame;
	const key = cf.functionName + "|" + cf.url + "|" + cf.lineNumber;
	const rec = byFn.get(key) || { name: cf.functionName || "(anonymous)", url: cf.url, line: cf.lineNumber + 1, selfMs: 0 };
	rec.selfMs += us / 1000;
	byFn.set(key, rec);
}

const top = [...byFn.values()].sort((a, b) => b.selfMs - a.selfMs).slice(0, 15);
const totalMs = [...selfUs.values()].reduce((a, b) => a + b, 0) / 1000;

console.log("=== CPU profile:", url, "===");
console.log("elapsed ms (goto+20s wait):", elapsed, " total sampled ms:", Math.round(totalMs));
console.log("top self-time functions:");
for (const t of top) console.log(`  ${t.selfMs.toFixed(1)}ms  ${t.name}  ${t.url.replace(/^https?:\/\/[^/]+/, "")}:${t.line}`);
console.log("console/page errors:", errs.slice(0, 10));

await close();
