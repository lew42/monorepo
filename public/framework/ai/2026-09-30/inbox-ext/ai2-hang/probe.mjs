import { createRequire } from "node:module"; const { chromium } = createRequire("C:/Users/mike/AppData/Roaming/npm/node_modules/")("playwright");
const b = await chromium.launch({ channel: "chromium" });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; pg.on("pageerror", e => errs.push(e.message)); pg.on("console", m => m.type() === "error" && errs.push(m.text()));
const t0 = Date.now();
await pg.goto(process.argv[2], { waitUntil: "load", timeout: 30000 }).catch(e => errs.push("goto " + e.message));
const probe = async () => pg.evaluate(() => new Promise(r => { const s = performance.now(); setTimeout(() => r(Math.round(performance.now() - s)), 0); })).catch(e => "ERR " + e.message);
for (let i = 0; i < 5; i++) { await new Promise(r => setTimeout(r, 2000)); console.log("t+" + ((Date.now() - t0) / 1000).toFixed(0) + "s timer lag ms:", await probe(), "nodes:", await pg.evaluate(() => document.querySelectorAll("*").length).catch(() => "?"), "heapMB:", await pg.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1e6)).catch(() => "?")); }
const dot = await pg.evaluate(() => [...document.querySelectorAll("[class*=dot]")].slice(0, 400).map(e => { const r = e.getBoundingClientRect(); return r.height > r.width * 1.8 && r.width > 0 ? e.className + " " + Math.round(r.width) + "x" + Math.round(r.height) : null; }).filter(Boolean).slice(0, 5)).catch(() => []);
console.log("stretched dots:", dot); console.log("errors:", errs.slice(0, 6));
await b.close();
