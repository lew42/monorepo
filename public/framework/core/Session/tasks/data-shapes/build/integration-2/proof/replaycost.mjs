// What michael/dev pays per streamed batch on top of the redraw: a whole replay of the record (its SessionTasks.read replays every line again).
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const browser = await chromium.launch(), page = await browser.newPage();
await page.goto("http://localhost:53219/framework/ai/sessions/2026/10/25/v-sq8y7db/", { waitUntil: "load" }); await page.waitForTimeout(6000);
console.log(JSON.stringify(await page.evaluate(async () => {
	const { default: Session } = await import("/framework/core/Session/Session.js");
	const text = await (await fetch(location.pathname + "session.jsonl")).text(), lines = text.trim().split("\n").map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	const ms = []; for (let i = 0; i < 5; i++){ const t = performance.now(); Session.replay(lines); ms.push(Math.round(performance.now() - t)); }
	return { lines: lines.length, whole_replay_ms: ms };
})));
await browser.close();
