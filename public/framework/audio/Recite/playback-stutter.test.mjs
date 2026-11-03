// node playback-stutter.test.mjs [base-url] — headless proof that read-aloud no longer restarts or repeats the start of a reply, and that
// the "words" interrupt pauses only for real words. Run with FENCE_SERVEX=1 (Server/ServexFence.mjs) so nothing reaches the live Servex.
// recite-server is stubbed (POST /speak answers a silent WAV) and Whisper is stubbed (POST /inference answers a chosen text), so neither
// Kokoro nor a microphone is needed: the "mic" is a fake object handed to BargeIn, the same way a real MicStream would be.
// Cause and log lines: ai/sessions/2026/10/20/session-e00f55c9/playback-stutter/findings.md
import { browser as get_browser } from "../../../../Server/Browser.mjs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

function wav(seconds = 3){
	const n = 8000 * seconds, b = Buffer.alloc(44 + n * 2);
	b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
	b.writeUInt32LE(8000, 24); b.writeUInt32LE(16000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
	return b;
}

const browser = await get_browser();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [], asked = [];
let whisper_says = "";
page.on("pageerror", e => errors.push(String(e)));
await page.route("**/speak", async route => {
	if (route.request().method() === "POST") asked.push(JSON.parse(route.request().postData() ?? "{}").text);
	await new Promise(r => setTimeout(r, 150));
	await route.fulfill({ status: 200, headers: { "content-type": "audio/wav", "x-recite-seconds": "3", "access-control-allow-origin": "*", "access-control-expose-headers": "x-recite-seconds" }, body: wav(3) });
});
await page.route("**/health", r => r.fulfill({ status: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: '{"ok":true}' }));
await page.route("**/inference", r => r.fulfill({ status: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: JSON.stringify({ text: whisper_says }) }));
await page.addInitScript(() => { try { localStorage.setItem("lew42.recite.auto", "true"); localStorage.removeItem("lew42.recite.places"); } catch {} });
await page.goto(base + "/framework/audio/Recite/", { waitUntil: "domcontentloaded" });

/** A fresh Recite (not the shared one: each case starts clean), with the owner's mic off. */
const fresh = () => page.evaluate(async () => {
	const R = (await import("/framework/audio/Recite/Recite.js")).default;
	const r = window.r = new R();
	r.barge.on = false; r.unlocked = true; r.auto = true;
	return true;
});
const sleep = ms => page.waitForTimeout(ms);
const STREAMED = "My answer was right. We use Kokoro only, nothing else is used here. The second thing is simple";
const FINAL = STREAMED + " and short. A third sentence follows.";
const line = (text, at = new Date().toISOString()) => ({ kind: "line", line: { chat: { from: { kind: "assistant", id: "smart" }, text, at } } });

/** Plays `streamed` growing in steps, then the end event, then the settled `final` line 4 times (every path delivers it). */
async function stream_then_final(streamed, final){
	asked.length = 0;
	await fresh();
	await page.evaluate(async ({ streamed, final }) => {
		const r = window.r, sleep = ms => new Promise(x => setTimeout(x, ms));
		for (let n = 20; n < streamed.length; n += 20){ r.from_wire({ kind: "stream", role: "smart", text: streamed.slice(0, n) }); await sleep(60); }
		r.from_wire({ kind: "stream", role: "smart", text: streamed });
		r.from_wire({ kind: "stream", role: "smart", text: "" });
		await sleep(200);
		const at = new Date().toISOString();
		for (let i = 0; i < 4; i++) r.from_wire({ kind: "line", line: { chat: { from: { kind: "assistant", id: "smart" }, text: final, at } } });
	}, { streamed, final });
	await sleep(600);
	return page.evaluate(() => ({ chunks: window.r.chunks.map(c => c.text), at: window.r.at, state: window.r.state }));
}

// 1. the settled line is longer than the stream's last text: the start of the reply is not read again
let got = await stream_then_final(STREAMED, FINAL);
check("longer settled line: the chunks joined are exactly the reply once (the cut-off sentence is finished, not read again)", got.chunks.join(" ") === FINAL, got.chunks);
check("longer settled line: the cut-off sentence's first words are asked of the voice once", asked.filter(t => t.includes("The second thing is simple")).length === 1, asked);
check("longer settled line: sentence 0 is rendered once, never asked again", asked.filter(t => t === "My answer was right.").length === 1, asked);

// 2. the settled line is the same text as the stream: nothing extra
got = await stream_then_final(FINAL, FINAL);
check("same settled line: the chunks joined are exactly the reply once", got.chunks.join(" ") === FINAL, got.chunks);
check("same settled line: sentence 0 is rendered once", asked.filter(t => t === "My answer was right.").length === 1, asked);

// 3. a settled line that is a different reply is still read in full, behind the first (never cutting it off)
got = await stream_then_final(STREAMED, "Something else entirely. It has two sentences.");
check("a different settled reply is queued behind, whole", got.chunks.slice(-2).join(" ") === "Something else entirely. It has two sentences." && got.at === 0, got);

// 4. the streamed reply did not restart while it played: the playhead only moved forward
await fresh();
const trail = await page.evaluate(async ({ streamed, final }) => {
	const r = window.r, sleep = ms => new Promise(x => setTimeout(x, ms)), seen = [];
	r.on(() => { if (r.state === "playing" && seen.at(-1) !== r.at) seen.push(r.at); });
	for (let n = 20; n < streamed.length; n += 20){ r.from_wire({ kind: "stream", role: "smart", text: streamed.slice(0, n) }); await sleep(60); }
	r.from_wire({ kind: "stream", role: "smart", text: "" });
	r.from_wire({ kind: "line", line: { chat: { from: { kind: "assistant", id: "smart" }, text: final, at: new Date().toISOString() } } });
	await sleep(1500);
	return seen;
}, { streamed: STREAMED, final: FINAL });
check("the playhead never goes back to sentence 0 after the settled line", trail.every((v, i) => i === 0 || v >= trail[i - 1]), trail);

// 5. the "words" interrupt: playing, a loud sound, Whisper answers ...
/** Sets up a Recite that is playing two sentences with a fake mic, then fires one loud sound; returns the state during and after the check. */
async function interrupt(mode, heard){
	whisper_says = heard;
	await fresh();
	return page.evaluate(async ({ mode }) => {
		const r = window.r, b = r.barge, sleep = ms => new Promise(x => setTimeout(x, ms));
		r.queue("The weather today is rather mild. Tomorrow it will rain a lot.");
		await sleep(900);
		b.mode = mode; b.on = true; b.listen_ms = 200; b.state = "listening";
		b.mic = { snapshot: () => new Float32Array(10), cut(){}, wav: () => new Blob(["x"]), stop(){} };   // a fake mic: only transcribe() touches it
		b.recent_peak = 0.9;
		const out = { before: r.state };
		const done = b.trigger();
		b.peak = 0.9;   // trigger() zeroes it and hear() would fill it while listening
		await sleep(80);
		out.during = r.state;   // the check is running: "volume" paused at once, "words" has not
		await done;
		await sleep(500);   // resume() is async (audio.play().then)
		out.after = r.state; out.note = b.note;
		return out;
	}, { mode });
}
let r1 = await interrupt("volume", "");
check("volume mode pauses the moment it is loud", r1.before === "playing" && r1.during === "heard", r1);
check("volume mode resumes after a cough (Whisper heard nothing)", r1.after === "playing", r1);
let r2 = await interrupt("words", "");
check("words mode keeps playing through a loud sound with no words", r2.before === "playing" && r2.during === "playing" && r2.after === "playing", r2);
let r3 = await interrupt("words", "Thank you.");
check("words mode ignores a Whisper phantom phrase", r3.during === "playing" && r3.after === "playing", r3);
let r4 = await interrupt("words", "the weather today is rather mild");
check("words mode ignores Recite's own voice coming back (echo)", r4.after === "playing", r4);
let r5 = await interrupt("words", "wait, can you stop for a second");
check("words mode cancels outright when Whisper hears real words (cutting in, 2026-11-03: no auto-resume by default)", r5.during === "playing" && r5.after === "idle", r5);

// 5b. cutting in (2026-11-03): real words through the own-mic trigger() path cancel the WHOLE queue (not just the
// playing reply) and report both through on_read, with no auto-resume.
whisper_says = "wait, can you stop for a second";
await fresh();
const cut_report = await page.evaluate(async () => {
	const r = window.r, b = r.barge, sleep = ms => new Promise(x => setTimeout(x, ms));
	const read = []; r.on_read = ev => read.push(ev);
	r.queue("The weather today is rather mild.");
	r.queue("Something else, queued behind it.");
	await sleep(900);
	b.mode = "words"; b.on = true; b.listen_ms = 200; b.state = "listening";
	b.mic = { snapshot: () => new Float32Array(10), cut(){}, wav: () => new Blob(["x"]), stop(){} };
	b.recent_peak = 0.9;
	const done = b.trigger();
	b.peak = 0.9;   // trigger() zeroes it synchronously; set it before the await settles, like the other interrupt() cases
	await done;
	await sleep(500);
	return { state: r.state, chunks: r.chunks.length, read };
});
check("cutting in: the trigger path cancels every queued reply, not just the one playing", cut_report.chunks === 0, cut_report);
check("cutting in: both replies were reported through on_read", cut_report.read.length === 2 && cut_report.read[0].heard === "cut" && cut_report.read[1].heard === "skipped", cut_report.read);
check("cutting in: it stays idle — no auto-resume by default", cut_report.state === "idle", cut_report.state);

// 5c. the start grace: a chunk's own first word, right after it starts (quiet when it began), does not trip the
// fast volume trigger — but real Whisper-confirmed words still cut in (the stopgap for the stutter).
await fresh();
const grace = await page.evaluate(async () => {
	const r = window.r, b = r.barge, sleep = ms => new Promise(x => setTimeout(x, ms));
	r.queue("A sentence that just started playing.");   // barge.on is still false here (fresh()): queue()'s own state
	// changes call barge.sync(), which would try to open a REAL mic the instant barge.on is true — set it after,
	// once playback has settled, same order the other interrupt() cases use
	await sleep(250);   // past the 150 ms render stub: the chunk is actually playing now, grace just started
	b.grace_ms = 300; b.on = true; b.mode = "volume"; b.hold_ms = 10; b.state = "listening";
	const before = r.state;
	b.hear(0.9);   // loud, but within the grace and the owner was quiet when it began
	await sleep(40);
	const during_grace = r.state;
	await sleep(400);   // past the grace window now
	b.hear(0.9); await sleep(20); b.hear(0.9);   // two frames, hold_ms apart: hear() only checks the clock on each new frame
	await sleep(40);
	return { before, during_grace, after_grace: r.state };
});
check("the start grace: a loud frame right after a quiet start does not trigger the fast pause", grace.before === "playing" && grace.during_grace === "playing", grace);
check("once the grace has passed, the same loud level does trigger it", grace.after_grace !== "playing", grace);

// 6. the setting is remembered and the plugin shape is there
const shape = await page.evaluate(async () => {
	const B = (await import("/framework/audio/Recite/BargeIn.js")).default;
	await (async () => {})();
	const R = (await import("/framework/audio/Recite/Recite.js")).default;
	const r = new R(); r.barge.set_mode("words");
	const again = new R();
	return { id: B.id, label: B.label, defaults: B.defaults, start: typeof r.barge.start, stop: typeof r.barge.stop, kept: again.barge.mode };
});
check("the setting is remembered across a reload and BargeIn has the plugin shape", shape.id === "barge" && shape.defaults.mode === "volume" && shape.start === "function" && shape.stop === "function" && shape.kept === "words", shape);
await page.evaluate(() => localStorage.removeItem("lew42.recite.barge_mode"));

check("no page errors", errors.length === 0, errors);
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
