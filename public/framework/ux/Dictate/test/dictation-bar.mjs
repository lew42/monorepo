// Proof for the DictationBar on the phone sheet. Headless only, never the owner's tabs; posting to Servex is stubbed.
//   node public/framework/ux/Dictate/test/dictation-bar.mjs <base-url> [shots dir] [--before]
// Opens the sheet at 400 (split), starts the fake mic (jfk.wav looping), waits for three delivered sentences, and counts
// LAYOUT JUMPS: elements whose top moved between two 50 ms samples. "chrome" = the sheet outside the thread
// (head, bar, composer); "thread" = bubbles, measured from the thread's own content top (a new line may push the older ones).
// --before: skip the bar checks (the old controls). Exit 1 on any failure.
import { pathToFileURL } from "url";

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const [base = "http://monorepo.localhost", shots] = args;
const before = process.argv.includes("--before");
const PW = process.env.PWENTRY ?? "C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "fs";
const here = new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const wav = process.env.WAV ?? (fs.existsSync(here) ? here : "C:/Code/lew42/monorepo/public/framework/ai/recordings/jfk.wav");   // recordings/ is git-ignored: a worktree has none
const { chromium } = await import(pathToFileURL(PW).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 240 s"); process.exit(2); }, 240000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };

const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, permissions: ["microphone"], hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [], said = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
// never post as the owner: every session verb is answered from here
await page.route(/\/api\/session\//, async route => {
	const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
	let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
	if (verb === "say") said.push(body.text);
	const out = verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : verb === "say" ? { ok: true, at: new Date().toISOString() } : { ok: true };
	await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(out) });
});
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, sessions: [] }) }));

await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("split", { listen: false }); });
await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
await page.waitForTimeout(800);

// the jump sampler: every 50 ms, the top of every box in the sheet
await page.evaluate(() => {
	const ids = new WeakMap(); let n = 0;
	const J = window.$J = { chrome: new Map(), thread: new Map(), seen: new Map() };
	const sheet = document.querySelector(".drawer-rail-sheet");
	const name = el => el.tagName.toLowerCase() + "." + (el.className?.toString?.().split(/\s+/).slice(0, 2).join(".") ?? "");
	setInterval(() => {
		const thread = sheet.querySelector(".ux-dictate-widget-thread");
		const tr = thread?.getBoundingClientRect();
		for (const el of sheet.querySelectorAll("*")){
			const r = el.getBoundingClientRect();
			if (!r.width && !r.height) continue;
			const inside = thread && thread.contains(el) && el !== thread;
			const id = ids.get(el) ?? (ids.set(el, ++n), n);
			const top = inside ? Math.round(r.top - tr.top + thread.scrollTop) : Math.round(r.top);
			const prev = J.seen.get(id);
			J.seen.set(id, top);
			if (prev !== undefined && Math.abs(prev - top) > 1){
				const bucket = inside ? J.thread : J.chrome;
				const e = bucket.get(id) ?? { name: name(el), moves: 0 };
				e.moves++; bucket.set(id, e);
			}
		}
	}, 50);
});

const mic = page.locator(".drawer-rail-sheet .dictation-bar-mic, .drawer-rail-sheet .chatbox-mic .ux-dictate-btn").first();
await mic.click();
const labels = new Set();
const t0 = Date.now();
while (said.length < 3 && Date.now() - t0 < 110000){
	await page.waitForTimeout(400);
	if (!before) labels.add(await page.locator(".dictation-bar-word").first().innerText().catch(() => ""));
}
const j = await page.evaluate(() => {
	const sum = m => ({ elements: m.size, moves: [...m.values()].reduce((a, e) => a + e.moves, 0), first: [...m.values()].slice(0, 6).map(e => e.name + "×" + e.moves) });
	return { chrome: sum($J.chrome), thread: sum($J.thread) };
});
if (shots) await page.screenshot({ path: `${shots}/${before ? "before" : "after"}-400-split.png` });
console.log(JSON.stringify({ sentences: said, labels: [...labels], jumps: j }));
check(said.length >= 3, `three sentences were delivered (${said.length})`);
if (!before){
	check(await page.locator(".dictation-bar-mic").count() > 0, "the dictation bar is on the sheet");
	check(await page.locator(".chatbox-compose-send:visible").count() === 0, "no Send button shows");
	check([...labels].some(l => /listening/i.test(l)), `the mic says what it is doing (${[...labels].join(", ")})`);
	check(j.chrome.elements === 0, `nothing in the bar or head jumped (${j.chrome.elements} elements moved, ${j.chrome.moves} moves)`);

	// Type reveals the box in place; the bar's mic keeps its top
	const top = async () => (await page.locator(".dictation-bar-mic").first().boundingBox())?.y;
	await page.locator(".dictation-bar-mic").first().click();   // pause
	const t1 = await top();
	await page.locator(".dictation-bar-type").first().click();
	await page.waitForTimeout(300);
	const box = page.locator(".chatbox-compose-input").first();
	check(await box.isVisible(), "Type shows the text box");
	if (shots) await page.screenshot({ path: `${shots}/after-400-type.png` });
	check(Math.abs((await top()) - t1) <= 1, `the mic did not move when the box opened (${t1} -> ${await top()})`);
	await page.locator(".dictation-bar-word").first().innerText().then(w => check(/paused|off/i.test(w), `the label says it stopped (${w})`));
}
check(!errors.length, "no page errors " + errors.join(" "));
clearTimeout(kill);
await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
