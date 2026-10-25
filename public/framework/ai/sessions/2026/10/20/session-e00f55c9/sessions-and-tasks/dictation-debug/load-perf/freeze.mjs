// Freezes while dictating, measured. node freeze.mjs <base> <session-file> <seconds> <tag>   [THROTTLE=n]
// Phone sheet over a saved session, a fake mic (driven by hand, as ux/Dictate/test/flicker.mjs does), every Servex call stubbed.
// Long tasks (>50 ms) come from a PerformanceObserver; each is matched to the CDP sampling profile for its time window.
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
const [base = "http://monorepo.localhost", file = "/framework/ai/sessions/2026/10/05/v-yxnts4l/session.jsonl", SECONDS = "60", tag = "freeze"] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const repo = path.resolve(here, "../../../../../../../../../../..");
const { default: Browser } = await import(pathToFileURL(path.join(repo, "Server/Browser.mjs")).href);
const browser = await Browser.browser({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const session = path.basename(path.dirname(file));
const SAY_MS = 1000, WORD_MS = 300;

const original = fs.readFileSync(path.join(repo, "public", file), "utf8");
const lines = [];   // chat lines the stubbed `say` adds
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, permissions: ["microphone"] });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(String(e.stack || e).slice(0, 500)));
await ctx.addInitScript(({ session, file }) => {
	try { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session, file })); } catch {}
	window.$m = { long: [], marks: {} };
	try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.$m.long.push({ start: e.startTime, dur: e.duration }); }).observe({ type: "longtask", buffered: true }); } catch {}
}, { session, file });
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
let hitl = 0, says = 0;
await page.route(/127\.0\.0\.1:8090\/api\/session\//, async route => {
	const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
	if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
	let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
	if (verb === "say"){
		says++; const at = new Date().toISOString();
		lines.push({ chat: { at, from: { kind: "owner" }, via: "voice", text: body.text } });
		await new Promise(r => setTimeout(r, SAY_MS));
		return json(route, { ok: true, at });
	}
	return json(route, verb === "new" || verb === "resume" ? { ok: true, session, file } : { ok: true });
});
await page.route(new RegExp(file.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "$"), r => r.fulfill({ status: 200, contentType: "text/plain", headers: cors, body: original + (original.endsWith("\n") ? "" : "\n") + lines.map(l => JSON.stringify(l)).join("\n") + (lines.length ? "\n" : "") }));
await page.route(/127\.0\.0\.1:8090\/api\/hitl/, async route => {
	if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
	hitl++; await new Promise(r => setTimeout(r, 300)); return json(route, { ok: true, marks: [{ i: 0, mark: "ok", purpose: "stub" }] });
});
await page.route(/127\.0\.0\.1:8090\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
const POOLW = "so the thing I want to try next is a smaller sheet that opens faster we should keep the words on screen while the model cleans them up the phone is slower than this computer so everything costs more there I think the first bubble has to be drawn before the history is read and then the pause sends everything that is on the screen at once maybe the marks should only be asked for when I actually talk it freezes for a moment every time a new sentence lands in the chat let me say another few words so the list keeps growing a little".split(" ");
let whisper_calls = 0;
await page.route(/127\.0\.0\.1:8178/, async route => {   // the Whisper server, stubbed: a guess that grows with the audio sent
	const req = route.request(), h = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: h });
	if (req.method() === "GET") return route.fulfill({ status: 200, contentType: "text/html", headers: h, body: "ok" });
	whisper_calls++;
	const secs = Math.max(0, (req.postDataBuffer()?.length ?? 0) - 400) / 32000;   // a 16 kHz mono 16-bit wav is 32000 bytes a second
	const n = Math.max(1, Math.floor(secs / 0.3)), words = []; for (let i = 0; i < n; i++) words.push(POOLW[i % POOLW.length]);
	await new Promise(r => setTimeout(r, 70));
	return route.fulfill({ status: 200, contentType: "application/json", headers: h, body: JSON.stringify({ text: " " + words.join(" ") + " ", segments: [] }) });
});
await page.route(/\/log\/prompts/, r => json(r, {}));
await page.route(/\/api\/refine\/live/, r => json(r, { ok: true, slots: [], outline: { sections: [] } }));

const cdp = await ctx.newCDPSession(page);
if (process.env.THROTTLE) await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.THROTTLE) });
await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
await page.goto(base + "/", { waitUntil: "load" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.waitForTimeout(1500);
await page.click(".drawer-rail-ai");
await page.waitForFunction(() => document.querySelectorAll(".drawer-rail-sheet.on .chatbox").length > 20, null, { timeout: 60000 });
await page.waitForTimeout(6000);   // replay done, the first polls in
const bubbles_before = await page.evaluate(() => document.querySelectorAll(".drawer-rail-sheet.on .chatbox").length);

await cdp.send("Profiler.start");
const t0_page = await page.evaluate(() => { window.$m.t0 = performance.now(); return window.$m.t0; });

// The script: continuous speech, a pause (send) after every 2 sentences
await page.evaluate(({ SECONDS, WORD_MS, REAL }) => {
	const m = globalThis.$dictate_widget.dictate, wait = ms => new Promise(r => setTimeout(r, ms));
	m.revise = false; window.$m.words = 0; window.$m.sent = 0;
	if (REAL){ (async () => { await m.start(); await wait(SECONDS * 1000 + 1000); try { await m.stop(); } catch {} await wait(1000); window.$m.done = true; })(); return; }
	m.state = "listening"; if (m.mic) m.mic.chunks ??= [];
	const POOL = ["so the thing I want to try next is a smaller sheet that opens faster", "we should keep the words on screen while the model cleans them up", "the phone is slower than this computer so everything costs more there", "I think the first bubble has to be drawn before the history is read", "and then the pause sends everything that is on the screen at once", "maybe the marks should only be asked for when I actually talk", "it freezes for a moment every time a new sentence lands in the chat", "let me say another few words so the list keeps growing a little"];
	let chunk = 0, k = 0;
	window.$m.words = 0; window.$m.sent = 0;
	globalThis.$freeze_done = (async () => {
		const end = performance.now() + SECONDS * 1000;
		while (performance.now() < end){
			for (let s = 0; s < 2 && performance.now() < end; s++){
				const text = POOL[k++ % POOL.length], words = text.split(" ");
				for (let n = 1; n <= words.length; n++){ m.partial_text = words.slice(0, n).join(" "); m.draw_caption(); window.$m.words++; await wait(WORD_MS); }
				m.partial_text = ""; m.log_prompt(text, ++chunk);
			}
			await wait(400); m.send_screen(); window.$m.sent++; await wait(600);
		}
		await wait(3000);
		return true;
	})();
}, { SECONDS: Number(SECONDS), WORD_MS, REAL: process.env.MODE !== "hand" });
await page.waitForFunction(() => window.$m.done === true, null, { timeout: (Number(SECONDS) + 60) * 1000, polling: 500 }).catch(() => {});
const prof = (await cdp.send("Profiler.stop")).profile;
const m = await page.evaluate(() => ({ ...window.$m, now: performance.now() }));
const bubbles_after = await page.evaluate(() => document.querySelectorAll(".drawer-rail-sheet.on .chatbox").length);
const offset = prof.startTime / 1000 - m.t0;   // profile clock (ms) minus page clock (ms), at the start of the window

// per-sample absolute page time
const byId = new Map(prof.nodes.map(n => [n.id, n])), parent = new Map();
for (const n of prof.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const keyOf = n => { const cf = n.callFrame; return `${cf.functionName || "(anon)"} ${cf.url.replace(/^https?:\/\/[^/]+/, "")}:${cf.lineNumber + 1}`; };
const samples = []; let tcur = prof.startTime;
for (let i = 0; i < prof.samples.length; i++){ tcur += prof.timeDeltas[i]; samples.push({ t: tcur / 1000 - offset, id: prof.samples[i], dt: (prof.timeDeltas[i + 1] ?? prof.timeDeltas[i]) / 1000 }); }
const long = m.long.filter(l => l.start >= m.t0 - 1).map(l => ({ start: Math.round(l.start - m.t0), dur: Math.round(l.dur), s: l.start, e: l.start + l.dur }));
const chain = id => { const out = []; while (id != null){ out.push(byId.get(id)); id = parent.get(id); } return out.reverse(); };
for (const l of long){
	const incl = new Map(), self = new Map(), roots = new Map(); let n = 0;
	for (const s of samples){
		if (s.t < l.s || s.t > l.e) continue; n++;
		const ch = chain(s.id), seen = new Set();
		for (const nd of ch){ if (!nd.callFrame.url) continue; const k = keyOf(nd); if (!seen.has(k)){ seen.add(k); incl.set(k, (incl.get(k) ?? 0) + s.dt); } }
		const user = ch.filter(nd => nd.callFrame.url); const first = user[0]; if (first){ const k = keyOf(first); roots.set(k, (roots.get(k) ?? 0) + s.dt); }
		const leaf = ch.at(-1); const lk = keyOf(leaf); self.set(lk, (self.get(lk) ?? 0) + s.dt);
	}
	const top = (map, k) => [...map].sort((a, b) => b[1] - a[1]).slice(0, k).map(([a, v]) => ({ at: a, ms: Math.round(v) }));
	l.entry = top(roots, 2); l.inclusive = top(incl, 6); l.self = top(self, 4); l.samples = n; delete l.s; delete l.e;
}
// whole-window self time (all main-thread activity, not only >50 ms tasks), by file:function
const wself = new Map(), wincl = new Map();
for (const s of samples){ const ch = chain(s.id), seen = new Set(); const lk = keyOf(ch.at(-1)); wself.set(lk, (wself.get(lk) ?? 0) + s.dt); for (const nd of ch){ if (!nd.callFrame.url) continue; const k = keyOf(nd); if (!seen.has(k)){ seen.add(k); wincl.set(k, (wincl.get(k) ?? 0) + s.dt); } } }
const topN = (map, k) => [...map].sort((a, b) => b[1] - a[1]).slice(0, k).map(([a, v]) => ({ at: a, ms: Math.round(v) }));
const out = { base, file, throttle: Number(process.env.THROTTLE || 1), seconds: Number(SECONDS), bubbles_before, bubbles_after, words: m.words, sends: m.sent, says, hitl_calls: hitl, whisper_calls, mode: process.env.MODE || "real", long_tasks: long, long_over_50: long.length, longest_ms: long.reduce((a, l) => Math.max(a, l.dur), 0), total_blocked_ms: long.reduce((a, l) => a + l.dur, 0), window_self_top: topN(wself, 14), window_inclusive_top: topN(wincl, 25), errors };
fs.writeFileSync(path.join(here, `${tag}.json`), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ throttle: out.throttle, bubbles_before, bubbles_after, words: m.words, sends: m.sent, says, hitl, whisper_calls, long_over_50: out.long_over_50, longest_ms: out.longest_ms, total_blocked_ms: out.total_blocked_ms, errors }));
await ctx.close(); await Browser.close();
