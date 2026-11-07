import fs from "node:fs";
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const [,, base, root, out, w = "400"] = process.argv;
const D = root + "/public/live/zzbleed", F = D + "/page.jsonl";
fs.mkdirSync(D, { recursive: true });
const code = "const sum = (a, b) => a + b; // a long line that should scroll sideways inside its own block, never the page";
fs.writeFileSync(F, [{ class: "/live/LivePage.js", title: "Bleed" },
 { content: { add: { type: "live-code", id: "k1", lang: "js", code, title: "A code card", caption: "edge to edge on a phone" } } },
 { content: { add: { type: "part-text", id: "t1", text: "A paragraph.\n\n```js\n" + code + "\n```" } } },
 { content: { add: { type: "part-card", id: "c1", title: "A card with code", text: "```js\n" + code + "\n```" } } },
 { content: { add: { type: "part-link", id: "l1", path: "./x/", title: "One-line link" } } },
 { content: { add: { type: "part-card", id: "c2", title: "A card", text: "Two lines of text so the card is taller than one line, to see where the chevron sits." } } },
].map(l => JSON.stringify(l)).join("\n") + "\n");
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(base + "/live/zzbleed/", { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
await p.evaluate(() => document.querySelector(".active-page .live-scroll").scrollTop = 0); await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll(".active-page pre")].map(e => { const r = e.closest(".live-code-wrap, pre").getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; }))));
await p.screenshot({ path: out });
await b.close(); fs.rmSync(F); fs.rmdirSync(D);
