import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const [,, base, force] = process.argv, rel = "/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
if (force) await p.route("**/ext/JSONL/live.js*", async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace("const WAIT = 1500;", "const WAIT = 1;") }); });
await p.goto(base + rel, { waitUntil: "networkidle" }); await p.waitForTimeout(6000);
console.log(force ? "forced:" : "normal:", await p.evaluate(() => [document.querySelector(".active-page .if-done")?.textContent, document.querySelectorAll(".active-page .in-flight .if-row").length + " rows", [...document.querySelectorAll(".active-page *")].map(e => e.textContent).find(t => /^\d+ of \d+ done$/.test(t?.trim() ?? ""))].join(" | ")));
await b.close();
