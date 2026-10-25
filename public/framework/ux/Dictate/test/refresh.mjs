// Proof: refresh, then dictate. The owner's typical failure: reload the page, press the mic, nothing works.
//   node public/framework/ux/Dictate/test/refresh.mjs <base-url> [runs=1] [scenario]
// Headless phone (400, touch), a fake mic playing jfk.wav, the real whisper-server on :8178, every Servex session verb stubbed
// (nothing is posted). Each round is what the owner does: press ✦, press the mic, speak; it passes when a sentence goes out
// (a `say` POST with words). Scenarios (default: all):
//   plain     dictate, reload, dictate again
//   pill      dictate; a file changes (a dev reload is deferred because the mic is busy: "This page is out of date"); press the pill; dictate again
//   deferred  dictate; a file changes; stop the mic (the tap must reach the mic, not the pill): no reload by itself; press the pill; dictate again
//   restart   dictate; a file changes; stop the mic and start it 1.5 s later: no reload under the owner
//   again     stop the mic and press it again 0.3 s later: it listens again, or the bar says why
//   twice     two reloads back to back, then dictate
// Exit 1 on any failure. Doc: ux/Dictate/doc/debug-tab.md#refresh-then-dictate
import fs from "fs";
import Browser from "../../../../../Server/Browser.mjs";

const [base = "http://monorepo.localhost", runs_arg = "1", only] = process.argv.slice(2);
const RUNS = +runs_arg || 1;
const here = new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const wav = process.env.WAV ?? (fs.existsSync(here) ? here : "C:/Code/lew42/monorepo/public/framework/ai/recordings/jfk.wav");   // recordings/ is git-ignored
const browser = await Browser.browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log(`FAIL killed after ${360 * RUNS} s`); process.exit(2); }, 360000 * RUNS);   // about 4.5 min a run
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };
const INFERENCE = /(:8178|\/whisper)\/inference/;   // whisper-server's transcribe call, direct or through the dev server's proxy
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };

async function context(){
	const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, permissions: ["microphone"], hasTouch: true, isMobile: true });
	const page = await ctx.newPage();
	const run = { said: [], errors: [], loads: 0 };
	page.on("pageerror", e => run.errors.push(String(e).slice(0, 200)));
	page.on("dialog", d => d.accept());   // the mic's reload guard ("Leave site?") is accepted, as the owner would
	page.on("load", () => run.loads++);
	// The mic’s audio module: every request for it, and how it ended (a failed load is "the mic will not start").
	run.worklet = [];
	page.on("requestfailed", q => { if (/pcm-worklet/.test(q.url())) run.worklet.push("failed " + q.failure()?.errorText); });
	page.on("response", res => { if (/pcm-worklet/.test(res.url())) run.worklet.push(String(res.status()) + (res.fromServiceWorker() ? " (service worker)" : "")); });
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say") run.said.push({ text: body.text, t: Date.now() });
		const out = verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : verb === "say" ? { ok: true, at: new Date().toISOString() } : { ok: true };
		await route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) });
	});
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
	await page.route(/\/api\/sessions\?/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, sessions: [] }) }));
	await page.route(/\/api\/hitl/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify({ ok: true, marks: [{ mark: "clear" }] }) }));
	await page.route(/\/log\/prompts/, r => r.fulfill({ status: 200, contentType: "application/json", headers: cors, body: "{}" }));
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	return { ctx, page, run };
}

// What the reader sees: the mic's state, the bar's words, the stale pill, and every mic on the page.
const look = page => page.evaluate(() => {
	const bar = document.querySelector(".drawer-rail-sheet .dictation-bar");
	return { sheet: !!document.querySelector(".drawer-rail-sheet.on"), mic: globalThis.$dictate_widget?.dictate?.state ?? null,
		bar: bar?.textContent?.replace(/\s+/g, " ").trim().slice(0, 160), pill: document.querySelector(".dev-stale-pill")?.textContent ?? null,
		health: Object.fromEntries(Object.entries(globalThis.DictateHealth?.layers ?? {}).map(([k, v]) => [k, v.state + ": " + v.why.slice(0, 90)])) };
}).catch(e => ({ gone: String(e).slice(0, 80) }));
const wait_for = async (page, fn, ms) => { const t = Date.now(); while (Date.now() - t < ms){ try { if (await fn()) return true; } catch {} await page.waitForTimeout(300); } return false; };

// One round: open the sheet with ✦ (unless open), press the mic (unless on), wait for a sentence with words to go out.
async function dictate(page, run, label){
	const t0 = Date.now(), before = run.said.length;
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	if (!await page.$(".drawer-rail-sheet.on")) await page.click(".drawer-rail-ai");
	await page.waitForSelector(".drawer-rail-sheet.on .dictation-bar-mic", { timeout: 20000 });
	await page.waitForTimeout(300);
	if (!["listening", "connecting"].includes((await look(page)).mic)) await page.click(".drawer-rail-sheet.on .dictation-bar-mic");   // ✦ starts the mic itself: press only when it is off
	const ok = await wait_for(page, () => run.said.slice(before).some(s => /\w{3}/.test(s.text ?? "")), 40000);
	const v = await look(page);
	check(ok, `${label}: a sentence went out ${ok ? ((run.said.find((s, i) => i >= before)?.t - t0) / 1000).toFixed(1) + " s after ✦" : "— none in 40 s"}${ok ? "" : " · " + JSON.stringify(v)}`);
	return ok;
}

// A file the page loaded changed: what LiveReload sends. The mic is busy, so Socket defers it and shows the pill.
const file_changed = page => page.evaluate(async () => { const { default: Socket } = await import("/framework/dev/Socket/Socket.js"); Socket.singleton().changed([location.pathname + "page.js"]); });
// The mic button, pressed as a finger would: whatever is on top at its centre gets the tap.
const tap_mic = page => page.evaluate(() => { const b = document.querySelector(".drawer-rail-sheet.on .dictation-bar-mic"), r = b.getBoundingClientRect();
	const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); (top ?? b).click(); return top === b || b.contains(top) ? "mic" : top?.className || top?.tagName; });

// After a dev reload the sheet comes back open by itself, and the mic bar says why the mic is off.
async function back_with_note(page){
	const open = await wait_for(page, async () => (await look(page)).sheet, 8000);
	const v = await look(page);
	check(open && /reloaded because a file changed/.test(v.bar ?? ""), `after the reload the sheet is back, the bar saying “${v.bar}”`);
}

const scenarios = {
	async plain({ page, run }){
		await dictate(page, run, "before the reload");
		await page.reload({ waitUntil: "domcontentloaded" });
		await dictate(page, run, "after a reload");
	},
	async pill({ page, run }){
		await dictate(page, run, "before");
		await file_changed(page);
		const pill = await wait_for(page, async () => !!(await look(page)).pill, 5000);
		check(pill, "a file change while dictating shows the stale pill, not a reload under the mic");
		const loads = run.loads;
		await page.click(".dev-stale-pill");
		await wait_for(page, () => run.loads > loads, 15000);
		await page.waitForLoadState("domcontentloaded");
		await back_with_note(page);
		await dictate(page, run, "after pressing the pill");
	},
	async deferred({ page, run }){
		await dictate(page, run, "before");
		await file_changed(page);
		await wait_for(page, async () => !!(await look(page)).pill, 5000);
		const loads = run.loads;
		const hit = await tap_mic(page);   // the owner stops the mic, with the pill showing
		check(hit === "mic", `with the pill showing, a tap on the mic reaches the mic (it reached: ${hit})`);
		if (hit !== "mic") await page.evaluate(() => document.querySelector(".drawer-rail-sheet.on .dictation-bar-mic").click());
		await page.waitForTimeout(6000);
		check(run.loads === loads && !!(await look(page)).pill, `6 s after the stop: ${run.loads === loads ? "not within 6 s, the pill waits for the owner" : "the page reloaded by itself"}`);
		await page.click(".dev-stale-pill");
		await wait_for(page, () => run.loads > loads, 15000);
		await page.waitForLoadState("domcontentloaded");
		await back_with_note(page);
		await dictate(page, run, "after the pill");
	},
	async restart({ page, run }){
		await dictate(page, run, "before");
		await file_changed(page);
		await wait_for(page, async () => !!(await look(page)).pill, 5000);
		const loads = run.loads, mic = () => page.evaluate(() => document.querySelector(".drawer-rail-sheet.on .dictation-bar-mic").click());
		await mic(); await page.waitForTimeout(1500); await mic();   // stop, then start again: the owner wants to keep talking
		await page.waitForTimeout(4000);
		check(run.loads === loads, `the mic stopped for 1.5 s and on again: ${run.loads === loads ? "no reload under it" : "the page reloaded under the owner"}`);
		await dictate(page, run, "after stop and start");
	},
	async again({ page, run }){   // "the mic sometimes will not start": stop, then press again at once
		await dictate(page, run, "before");
		const mic = () => page.evaluate(() => document.querySelector(".drawer-rail-sheet.on .dictation-bar-mic").click());
		await page.route(INFERENCE, async route => { await new Promise(r => setTimeout(r, 3000)); route.continue().catch(() => {}); });   // a slow Whisper (the LAN proxy, a busy GPU)
		await mic(); await page.waitForTimeout(300);
		const mid = await look(page);
		await mic(); await page.waitForTimeout(4000);
		const v = await look(page);
		await page.unroute(INFERENCE);
		check(v.mic === "listening" || v.mic === "connecting" || /·/.test(v.bar ?? "") && v.mic === "error",
			`pressed again 0.3 s after stopping (it was ${mid.mic}): the mic is ${v.mic}, the bar says “${v.bar}”`);
		await dictate(page, run, "after stop and press again");
	},
	async twice({ page, run }){
		await dictate(page, run, "before");
		await page.reload({ waitUntil: "domcontentloaded" });
		await page.reload({ waitUntil: "domcontentloaded" });
		await dictate(page, run, "after two reloads");
	},
};

for (let n = 1; n <= RUNS; n++){
	for (const [name, fn] of Object.entries(scenarios)){
		if (only && !only.split(",").includes(name)) continue;
		console.log(`-- run ${n}/${RUNS}: ${name}`);
		const { ctx, page, run } = await context();
		try { await fn({ page, run }); } catch (e){ check(false, name + " threw: " + e.message.split("\n")[0]); console.log("     " + JSON.stringify(await look(page))); }
		if (failed) console.log("     pcm-worklet.js requests: " + (run.worklet.join(", ") || "none"));
		check(!run.errors.length, run.errors.length ? "page errors: " + run.errors.join(" | ") : "no page errors");
		await Promise.race([ctx.close(), new Promise(r => setTimeout(r, 15000))]);   // a page stuck mid-reload must not hold the run (it once hung 30 min)
	}
}
await Browser.close();
clearTimeout(kill);
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
