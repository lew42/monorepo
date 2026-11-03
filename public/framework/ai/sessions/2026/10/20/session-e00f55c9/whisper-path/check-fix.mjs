#!/usr/bin/env node
/* check-fix.mjs — proves the two upload fixes in a real page, headless.
 *   node check-fix.mjs [base url]
 * 1. Capture.wav() now sends 8-bit mu-law: bytes per second of audio, and whisper-server's text for a saved clip.
 * 2. A final no longer waits behind a guess: a 3 s slow link is faked for guesses only, a guess is started,
 *    then the segment closes; the final's answer time is measured (before the fix: about 3 s more). */
import fs from "node:fs";
import path from "node:path";
import Browser from "../../../../../../../../../Server/Browser.mjs";

const base = process.argv[2] || "http://localhost:61255";
const clip = fs.readFileSync(path.resolve(import.meta.dirname, "../../../../09/22/whisper-servex/whisper-servex/clip.wav"));
const browser = await Browser.browser();
const page = await (await browser.newContext()).newPage();
const errors = []; page.on("pageerror", e => errors.push(e.message));
await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });

const out = await page.evaluate(async b64 => {
	const { default: Capture } = await import("/framework/ux/Dictate/capture.js");
	const { default: Dictate } = await import("/framework/ux/Dictate/Dictate.js");
	const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), dv = new DataView(bytes.buffer);
	const at = 44, n = (bytes.length - at) >> 1, samples = new Float32Array(n);
	for (let i = 0; i < n; i++) samples[i] = dv.getInt16(at + i * 2, true) / 0x8000;
	const cap = Object.create(Capture.prototype); cap.rate = () => 16000;
	const wav = cap.wav(samples), head = new DataView(await wav.slice(0, 44).arrayBuffer());
	const form = new FormData(); form.append("file", wav, "segment.wav"); form.append("response_format", "json");
	const text = (await (await fetch(location.origin + "/whisper/inference", { method: "POST", body: form })).json()).text?.trim();

	// 2: a Dictate with only what transcribe/partial_tick/close_segment touch
	const d = Object.create(Dictate.prototype);
	Object.assign(d, { mic: { snapshot: () => samples, cut(){}, wav: s => cap.wav(s), rate: () => 16000 }, whisper_url: location.origin + "/whisper",
		segment_epoch: 1, req_seq: 0, applied_seq: 0, has_speech: true, last_loud_at: performance.now(), steps: {}, heard_first_answer: true, log_raw: false,
		draw_caption(){}, draw_diag(){}, on_guess(){}, clear_guess(){}, log_step(){}, dump(){}, worth_sending: () => true });
	let final_at = 0; d.commit = () => { final_at = performance.now(); };
	const real = window.fetch;
	window.fetch = (url, opts) => { const guess = opts?.body?.get?.("response_format") === "json" && !d.closing; return guess
		? new Promise((ok, no) => { const t = setTimeout(() => real(url, opts).then(ok, no), 3000); opts.signal?.addEventListener("abort", () => { clearTimeout(t); no(new DOMException("aborted", "AbortError")); }); })
		: real(url, opts); };
	d.last_loud_at = performance.now();
	const guess = d.partial_tick();
	await new Promise(r => setTimeout(r, 200));
	const t0 = performance.now(); d.closing = true;
	await d.close_segment("pause");
	await guess;
	window.fetch = real;
	return { fmt: head.getUint16(20, true), bits: head.getUint16(34, true), bytes_per_s: Math.round(wav.size / (n / 16000)), text, final_ms: Math.round(final_at - t0) };
}, clip.toString("base64"));

console.log(`1. Capture.wav: WAVE format ${out.fmt} (7 = mu-law), ${out.bits} bits, ${out.bytes_per_s} bytes a second (16-bit PCM: 32000)`);
console.log(`   whisper-server read it: "${out.text}"`);
console.log(`2. final answered ${out.final_ms} ms after the segment closed, with a 3 s guess in flight (waiting for the guess would be over 2800 ms)`);
console.log(errors.length ? "page errors: " + errors.join(" | ") : "no page errors");
const ok = out.fmt === 7 && /ask not what your country/i.test(out.text ?? "") && out.final_ms < 2000 && !errors.length;
console.log(ok ? "PASS" : "FAIL");
await Browser.close();
process.exit(ok ? 0 : 1);
