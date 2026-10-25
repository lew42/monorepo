/* WakePolicy: when does a voice session's SMART seat (the voice mastermind, an Opus turn) hear the owner?
 * Not per sentence. The fast seat and the page do the cheap per-sentence work; the smart seat is fed ONE batch when
 *   1. the owner paused: no new line for `gap_ms`            ("paused 6 s"),
 *   2. the owner asked something (a line that ends in "?") or spoke to the smart seat by name   ("asked"),
 *   3. `every` sentences have piled up since the last batch   ("6 sentences").
 * Pure: the clock and timers are injected, so a test runs two minutes of dictation in no time and calls no model.
 * Doc: ux/Dictate/doc/wake-policy.md. Used by Sessions.js (`waker`). */

/* THE KNOBS, in one place. Per session they live on the session's entry in Servex's sessions.json (`wake`, set through
 * POST /api/session/settings {session, gap_ms, every}); a session with none uses these (env overrides at boot). The
 * dictation widget's settings panel sets them through that route. */
export const WAKE_DEFAULTS = { gap_ms: 12000, every: 6 };   // 12 s: the owner asked for a batch every ~10-15 s. ext/Chat/Mic.js shows these as its placeholders; change both together
export const WAKE_LIMITS = { gap_ms: [1000, 60000], every: [1, 50] };

/* Addressed by name: a sentence that STARTS with "smart"/"mastermind" (optionally after hey/okay), or says "smart assistant" not as
 * a possessive. A mastermind merely mentioned ("go ahead and spawn that mastermind") does not wake it: only talking TO it does. */
export const SMART_NAMED = /(?:^|\n|[.!?]\s+|\]\s)\W*(?:(?:hey|ok(?:ay)?|yo)\W+)?(?:smart|mastermind)\b|\bsmart assistant\b(?!['’]s)/i;

export const sentence_count = text => Math.max(1, String(text ?? "").split(/(?<=[.!?])\s+/).filter(s => s.trim()).length);
/* A question is a line that ENDS asking. A rhetorical "?" in the middle of a long dictation, followed by more words, is not a wake. */
export const is_question = text => /\?["'’)\]]*\s*$/.test(String(text ?? ""));
export const is_addressed = text => SMART_NAMED.test(String(text ?? ""));

export default class WakePolicy {

	/* `flush(id, lines, why, info)` is called with a batch. `clock` = {set, clear} (default: real timers, unref'd).
	 * `stored(id)` returns a session's own knobs (Sessions.js: the `wake` field of its sessions.json entry). */
	constructor({ flush, clock, defaults, stored } = {}){
		this.flush_fn = flush;
		this.stored = stored ?? (() => null);
		this.clock = clock ?? { set: (fn, ms) => { const t = setTimeout(fn, ms); t.unref?.(); return t; }, clear: t => clearTimeout(t) };
		this.defaults = { ...WAKE_DEFAULTS, ...defaults };
		this.pending = new Map();    // session id -> {lines, sentences, timer, gap}
		this.speaking = new Set();   // session ids whose owner is mid-sentence: no pause can be running
	}

	knobs(id){ return { ...this.defaults, ...this.stored(id) }; }

	/* Validate a patch against a session's own knobs and return the new own-knobs object for the caller to keep
	 * (null/undefined drops a knob back to the default). */
	checked(id, patch = {}){
		const next = { ...this.stored(id) };
		for (const k of Object.keys(WAKE_LIMITS)){
			if (!(k in patch)) continue;
			if (patch[k] == null){ delete next[k]; continue; }
			const n = Math.round(Number(patch[k])), [lo, hi] = WAKE_LIMITS[k];
			if (!Number.isFinite(n) || n < lo || n > hi) throw Object.assign(new Error(`${k} must be a number from ${lo} to ${hi}`), { status: 400 });
			next[k] = n;
		}
		return next;
	}

	/* Add lines to the session's batch. `hold_ms` replaces the pause gap for this push (a typed line is a deliberate send, so
	 * Sessions.js gives it its short quiet_ms); `elapsed_ms` is silence already measured, which counts toward the gap.
	 * Returns "asked", "<N> sentences" if that flushed the batch, else null. */
	add(id, lines, { hold_ms, elapsed_ms = 0 } = {}){
		lines = [].concat(lines).filter(l => String(l?.text ?? "").trim());
		if (!lines.length) return null;
		const p = this.pending.get(id) ?? { lines: [], sentences: 0, timer: null };
		p.lines.push(...lines);
		p.sentences += lines.reduce((n, l) => n + sentence_count(l.text), 0);
		this.pending.set(id, p);
		this.clock.clear(p.timer);
		const k = this.knobs(id);
		if (lines.some(l => is_question(l.text) || is_addressed(l.text))){ this.flush(id, "asked"); return "asked"; }
		if (p.sentences >= k.every){ const why = `${p.sentences} sentences`; this.flush(id, why); return why; }
		p.gap = hold_ms ?? k.gap_ms;
		if (!this.speaking.has(id)) this.arm(id, p, Math.max(0, p.gap - elapsed_ms));
		return null;
	}

	arm(id, p, ms){
		const gap = p.gap;
		p.timer = this.clock.set(() => this.flush(id, `paused ${(gap / 1000).toFixed(1).replace(/\.0$/, "")} s`), ms);
	}

	/* The owner started talking again (the floor is "speaking"): no pause is running, so a timer already counting stops. */
	hold(id){
		this.speaking.add(id);
		const p = this.pending.get(id);
		if (p) this.clock.clear(p.timer);
	}

	/* The floor is "done": the owner is silent from now, so the batch waiting gets a whole gap from this moment. */
	resume(id){
		this.speaking.delete(id);
		const p = this.pending.get(id);
		if (p?.lines.length){ this.clock.clear(p.timer); this.arm(id, p, p.gap ?? this.knobs(id).gap_ms); }
	}

	/* The page measured real silence (Sessions.quiet): a pause as long as the gap needs no timer. */
	silence(id, ms){
		const p = this.pending.get(id);
		return !!p && ms >= this.knobs(id).gap_ms && this.flush(id, `paused ${(ms / 1000).toFixed(1).replace(/\.0$/, "")} s`);
	}

	/* Hand the batch over now. `why` rides along as the cue ("asked", "paused 6 s", "6 sentences", "mic off"). */
	flush(id, why = "now"){
		const p = this.pending.get(id);
		if (!p?.lines.length) return false;
		this.clock.clear(p.timer);
		this.pending.delete(id);
		this.flush_fn?.(id, p.lines, why, { sentences: p.sentences });
		return true;
	}

	size(id){ return this.pending.get(id)?.lines.length ?? 0; }
}
