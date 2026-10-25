// Proof that the chat thread on the phone sheet never pushes older lines while you read. Headless only; posting is stubbed.
//   node public/framework/ux/Dictate/test/anchor.mjs <base-url> [shots dir] [--strip] [--scrolled] [--sentences=5]
// Opens the sheet at 400 (split, or --strip), starts the fake mic (jfk.wav looping), waits for N delivered sentences and counts
// MOVES: every 50 ms the VIEWPORT top of each bubble and of the composer; a change over 1 px is one move.
//   default     the reader sits at the bottom (the anchor): the newest line may grow, nothing already on screen may move.
//   --scrolled  the reader scrolled up after the first sentence: nothing may move at all.
// Exit 1 on any failure.
import { pathToFileURL } from "url";
import fs from "fs";

const flag = n => process.argv.includes("--" + n);
const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const [base = "http://monorepo.localhost", shots] = args;
const strip = flag("strip"), scrolled = flag("scrolled");
const N = +(process.argv.find(a => a.startsWith("--sentences="))?.split("=")[1] ?? 5);
const SIZE = strip ? "compact" : "full";
const PW = process.env.PWENTRY ?? "C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const here = new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const wav = process.env.WAV ?? (fs.existsSync(here) ? here : "C:/Code/lew42/monorepo/public/framework/ai/recordings/jfk.wav");   // recordings/ is git-ignored: a worktree has none
const { chromium } = await import(pathToFileURL(PW).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 400 s"); process.exit(2); }, 400000);
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
	if (verb.endsWith("/stream")) return;   // the live wire stays pending, never refused or closed: a dead wire shows the sheet's "Servex link down" banner after 8 s, a real 52 px shift that is not streaming
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
if (strip){ await page.evaluate(() => window.$sheet.to("strip", { listen: false })); await page.waitForTimeout(600); }

// the sampler: viewport top of every bubble (and its text pieces) and of the composer; a bubble that is clipped by the thread still counts
await page.evaluate(() => {
	const ids = new WeakMap(); let n = 0;
	const M = window.$M = { moves: new Map(), turns: new Map(), seen: new Map(), armed: false, log: [], nb: 0, turn_until: 0 };
	const sheet = document.querySelector(".drawer-rail-sheet");
	const name = el => el.tagName.toLowerCase() + "." + (el.className?.toString?.().split(/\s+/).slice(0, 2).join(".") ?? "");
	M.trace = [];
	setInterval(() => {
		const th = sheet.querySelector(".ux-dictate-widget-thread");
		if (M.armed && th) M.trace.push(["T" + Math.round(th.getBoundingClientRect().top), th.scrollTop, th.scrollHeight, th.clientHeight, [...th.querySelectorAll(".ux-dictate-widget-bubbles > *")].map(e => e.className.toString().split(" ")[0] + ":" + Math.round(e.getBoundingClientRect().top) + "/" + Math.round(e.getBoundingClientRect().height)).join(" ")].join(" | "));
		const nb = th?.dataset.turns ?? "0";
		if (nb !== M.nb){ M.nb = nb; M.turn_until = performance.now() + 80; }   // the thread turned a page (data-turns): a "turn"; any other move is a "stream" move, which is the failure
		const els = [...sheet.querySelectorAll(".ux-dictate-widget-bubbles > *, .chatbox-compose, .dictation-bar, .drawer-rail-head, .drawer-rail-sheet-live, .drawer-rail-sheet-live > *")];
		for (const el of els){
			const r = el.getBoundingClientRect();
			if (!r.width && !r.height) continue;
			const id = ids.get(el) ?? (ids.set(el, ++n), n);
			const top = Math.round(r.top), prev = M.seen.get(id);
			M.seen.set(id, top);
			if (M.armed && prev !== undefined && Math.abs(prev - top) > 1){
				const turn = performance.now() < M.turn_until, book = turn ? M.turns : M.moves;
				const e = book.get(id) ?? { name: name(el), moves: 0 };
				e.moves++; book.set(id, e);
				if (!turn && M.log.length < 12) M.log.push(name(el) + " " + prev + "->" + top);
			}
		}
	}, 50);
});

const mic = page.locator(`.drawer-rail-sheet .dictation-bar[data-size=${SIZE}] .dictation-bar-mic`).first();
await mic.click();
const t0 = Date.now();
let armed = false;
while (said.length < N && Date.now() - t0 < 330000){
	await page.waitForTimeout(300);
	const ready = !scrolled || await page.evaluate(() => { const t = document.querySelector(".drawer-rail-sheet .ux-dictate-widget-thread"); return t.scrollTop > 0; });   // a reader can only scroll UP from a thread that has scrolled
	if (!armed && said.length >= 1 && ready){
		armed = true;
		if (scrolled) await page.evaluate(() => { const t = document.querySelector(".drawer-rail-sheet .ux-dictate-widget-thread"); t.scrollTop = 0; });
		await page.waitForTimeout(200);
		await page.evaluate(() => { $M.armed = true; $M.seen.clear(); });   // count only after the reader has settled
	}
}
const out = await page.evaluate(() => {
	const t = document.querySelector(".drawer-rail-sheet .ux-dictate-widget-thread");
	return { pages: +t?.dataset.turns || 0, turns: [...$M.turns.values()].reduce((a, e) => a + e.moves, 0), elements: $M.moves.size, moves: [...$M.moves.values()].reduce((a, e) => a + e.moves, 0), first: $M.log, scrollTop: t?.scrollTop, scrollHeight: t?.scrollHeight, client: t?.clientHeight, bubbles: document.querySelectorAll(".ux-dictate-widget-bubbles > *").length };
});
if (shots) await page.screenshot({ path: `${shots}/${new Date().toISOString().slice(0, 19).replace(/\D/g, "")}-${strip ? "strip" : "split"}${scrolled ? "-scrolled" : ""}.png` });
console.log(JSON.stringify({ sentences: said.length, ...out }));
if (flag("trace")) console.log((await page.evaluate(() => $M.trace.filter((r, i, a) => i === 0 || r !== a[i - 1]))).join("\n"));
check(said.length >= N, `${N} sentences were delivered (${said.length})`);
check(out.elements === 0, `no box moved while words streamed in (${out.elements} boxes, ${out.moves} moves; ${out.turns} moves in page turns, in ${out.pages} turns) ${out.first.join(" | ")}`);
if (scrolled) check(out.turns === 0, `the reader had scrolled up: not even a page turn moved anything (${out.turns})`);
check(!errors.length, "no page errors " + errors.join(" "));
clearTimeout(kill);
await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
