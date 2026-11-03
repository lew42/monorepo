/**
 * should_drop_phantom — the send-side gate: a stock Whisper hallucination ("Thank you.", "you"…) must never reach the
 * chat at all, not just fail to interrupt a reply. `audio/Recite/BargeIn` already tells a real interruption from one
 * of these (`noise()`'s blocklist, `echo()`'s fuzzy match against what Recite is reading) but only on the READ side,
 * after the line already posted (`audio/Recite/doc/architecture.md`, "open item"); this runs the SAME two checks
 * again BEFORE the post — never a second blocklist (CLAUDE.md law 6) — which is why `noise` is passed in as
 * `BargeIn.noise` itself rather than imported here: this file stays a plain function a node test can load with no
 * browser, while `BargeIn.js` (which pulls in MicStream/Whisper/Part, all of them browser-only) stays the one place
 * the phrase list and the fuzzy match live. The caller is `ux/Dictate/chat.js`, which already imports `audio/Recite`.
 *
 * `info` is what the real Whisper reply says about the clip: `duration_s` (its `seconds`/`body.duration`) and
 * `word_prob` (the lowest per-word `probability` in `body.segments[].words`) — both `undefined` when unknown (a
 * typed line, or a build whose Whisper call never asked for `verbose_json`), in which case that half of the OR
 * below just can't fire, not "true". `recite` is anything with `echo_active()` (and, for the echo check, a `barge`
 * with `echo(text)`) — the real `Recite.shared`, or a stub in a test. `noise` is `BargeIn.noise` (or a stand-in).
 *
 * A clip under SHORT_CLIP_S or whose weakest word is under LOW_WORD_PROB is the "true silence hallucination" shape
 * (seq175, 2026-11-01: 1.4 s, weakest word 0.14) even with Recite silent. Otherwise a phantom phrase heard while
 * Recite is speaking (or just stopped, `echo_active()`) is the "heard its own TTS" shape (seq995, 2026-11-03) —
 * never the duration or the word probability alone, since a real "Thank you." said slowly and clearly must land.
 */
export const SHORT_CLIP_S = 2;
export const LOW_WORD_PROB = 0.3;

export function should_drop_phantom(text, info = {}, { noise, recite } = {}){
	if (!text || typeof noise !== "function") return false;
	const { duration_s, word_prob } = info;
	const echo_active = !!recite?.echo_active?.();
	if (noise(text)){
		if (echo_active) return "echo-while-noise";
		if (typeof duration_s === "number" && duration_s < SHORT_CLIP_S) return "short-clip";
		if (typeof word_prob === "number" && word_prob < LOW_WORD_PROB) return "low-word-prob";
		return false;
	}
	if (echo_active && recite?.barge?.echo?.(text)) return "echo-match";
	return false;
}

/** The two fields `should_drop_phantom` reads, pulled from one `on_whisper` line (`ux/Dictate/Dictate.js`'s shape:
 *  `{seconds, body}`, `body` = whisper-server's own reply; `body.segments[].words[].probability` only exists when
 *  the request asked for `verbose_json`, true for a "final" when `Dictate.log_raw` is on, its own default). */
export function whisper_info(line){
	const duration_s = line?.body?.duration ?? line?.seconds;
	const words = (line?.body?.segments ?? []).flatMap(s => s.words ?? []);
	const probs = words.map(w => w.probability).filter(p => typeof p === "number");
	return { duration_s, word_prob: probs.length ? Math.min(...probs) : undefined };
}
