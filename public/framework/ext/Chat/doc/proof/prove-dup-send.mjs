// Proof for ext/Chat/doc/duplicate-bubbles.md — drives a REAL ComposerMic (no mic, no Whisper: a fake Capture
// and a scripted transcribe) through the exact sequence behind the owner's duplicate bubbles, and counts what
// reaches deliver(). Usage: node prove-dup-send.mjs <base url>   (exit 1 when any scenario sent a duplicate)
const { browser, close } = await import(new URL("../../../../../../Server/browser.mjs", import.meta.url).href);
const BASE = process.argv[2] || "http://localhost:54923";
const b = await browser(), page = await (await b.newContext()).newPage();
page.on("pageerror", e => console.log("PAGEERROR", e.message));
await page.goto(BASE + "/framework/ext/Chat/", { waitUntil: "load" });

const out = await page.evaluate(async () => {
	const { composer } = await import("/framework/ext/Chat/Composer.js");
	const wait = ms => new Promise(r => setTimeout(r, ms));
	// One scenario: the guess is on screen, the segment closes, Send/auto-send fires while the FINAL is still in flight,
	// then the final arrives worded a little differently from the guess (Whisper always does this).
	async function scenario(name, guess, final, { send_before_close = false, final_ms = 150 } = {}){
		const sent = [];
		const view = composer({ deliver: async e => { sent.push(e.text); return true; } });
		document.body.append(view.el ?? view);
		const m = view.mic;
		m.state = "listening"; m.engine = "whisper"; m.segment_epoch = 0; m.req_seq = 0; m.applied_seq = 0;
		m.mic = { snapshot: () => new Float32Array(16), cut(){}, loudness: () => ({ loud_ms: 999 }), wav: () => new Blob(), rate: () => 16000, stop(){} };
		m.dump = () => {}; m.last_speech = performance.now();
		let answer = guess;
		m.transcribe = async () => { await wait(answer === guess ? 5 : final_ms); return answer; };
		m.has_speech = true;
		await m.partial_tick();                       // the grey guess appears
		if (send_before_close) { await m.send_screen(); }
		answer = final;
		const closing = m.close_segment("pause");     // segment closes, final in flight
		await wait(20);
		if (!send_before_close) await m.send_screen();// Send / natural-pause send reads the screen: guess included
		await closing; await wait(400);
		await m.send_screen();                        // the next natural-pause tick sends whatever is left
		await m.send_sentences?.(1); await wait(300);
		return { name, sent };
	}
	const rows = [];
	// expect = how many messages a correct mic sends for ONE spoken segment
	rows.push({ expect: 1, ...await scenario("guess sent, final re-punctuated",
		"Holy smokes. Okay. So you just responded. Okay.", "Holy smokes. Okay, so you just responded.") });
	rows.push({ expect: 1, ...await scenario("guess sent, final one word off",
		"ask not what your country can do for you", "Ask not what your county can do for you.") });
	rows.push({ expect: 1, ...await scenario("guess sent, final hears two words differently",
		"so the green check mark comes after the first line", "So the green checkmark comes after the first lime.") });
	rows.push({ expect: 2, ...await scenario("guess sent, final adds a NEW sentence (must still go out)",
		"There's a green check mark after the first line", "There's a green check mark after the first line. There's a microphone after that.") });
	// The owner's real session (v-0kfikyu, 2026-10-09): a doubled raw, then the same question re-heard one letter off, 300 ms later.
	async function direct(name, expect, items){
		const sent = [];
		const view = composer({ deliver: async e => { sent.push(e.text + (e.raw ? "  [raw: " + e.raw + "]" : "")); return true; } });
		document.body.append(view.el ?? view);
		for (const it of items){ await view.mic.post_held(it); await wait(300); }
		return { name, sent, expect };
	}
	rows.push(await direct("doubled raw, then re-heard one letter off", 1, [
		{ text: "What is minion-kak?", raw: "What is minion-kak? What is minion-kak?" }, { text: "What is minion-kaq?" }]));
	rows.push(await direct("a real repeat of a different sentence still goes out", 2, [{ text: "Turn on the lights." }, { text: "Now turn them off please." }]));
	return rows;
});
let bad = 0;
for (const r of out){
	const words = r.sent.join(" ").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
	const dup = r.sent.length !== r.expect;
	if (dup) bad++;
	console.log((dup ? "DUPLICATE " : "ok        ") + r.name + "\n    sent " + r.sent.length + ": " + JSON.stringify(r.sent));
}
await close();
process.exit(bad ? 1 : 0);
