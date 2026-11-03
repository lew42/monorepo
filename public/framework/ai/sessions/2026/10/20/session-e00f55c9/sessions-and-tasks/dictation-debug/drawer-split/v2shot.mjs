// node v2shot.mjs <base url> <width> <tag>: a Chat v2 session at the top and scrolled to the bottom (the room under the last card)
import { browser } from "../../../../../../../../../../../Server/Browser.mjs";
const BASE = process.argv[2] || process.env.BASE, W = +process.argv[3], tag = process.argv[4];
const dir = new URL("./shots/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const b = await browser();
const p = await (await b.newContext({ viewport: { width: W, height: 900 } })).newPage();
await p.goto(BASE + "/framework/ext/Chat/v2/?src=/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.evaluate(() => document.querySelector(".chat-v2-toggle")?.click());
await p.waitForTimeout(500);
await p.screenshot({ path: dir + `v2-${tag}-${W}.png` });
await p.evaluate(() => { const e = document.querySelector(".chat-v2"); for (let n = e; n; n = n.parentElement) n.scrollTop = 1e6; window.scrollTo(0, 1e6); });
await p.waitForTimeout(500);
await p.screenshot({ path: dir + `v2-${tag}-bottom-${W}.png` });
await b.close();
